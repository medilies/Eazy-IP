<?php
class Router
{
    private $currentController = "pages";
    private $currentMethod = 'index';
    private $params = [];

    public function __construct()
    {
        $url = $this->getUrl();

        $this->access_control(implode("/", $url));

        /* =========================================================== */
        /*                Instaniate a controller                      */
        /* =========================================================== */
        // Look in controllers if url is set
        if (file_exists('../app/controllers/' . ucwords($url[0]) . '.php')) {
            // If exists, set as controller
            $this->currentController = ucwords($url[0]);
            // pop 0 Index
            array_shift($url);
        }
        // Require the controller
        require_once '../app/controllers/' . $this->currentController . '.php';
        // Instantiate controller class
        $this->currentController = new $this->currentController;

        /* =========================================================== */
        /*                        Set method                           */
        /* =========================================================== */
        // Check for second part of url
        if (isset($url[0])) {
            // Check to see if method exists in controller
            // ? add is_callable() to avoid problem with private/protected moethods
            if (method_exists($this->currentController, $url[0])) {
                $this->currentMethod = $url[0];
                // Unset 1 index
                array_shift($url);
            }
        }

        /* =========================================================== */
        /*             Call controller's method with params            */
        /* =========================================================== */
        $this->params = $url ? array_values($url) : [];
        unset($url);
        call_user_func_array([$this->currentController, $this->currentMethod], $this->params);

    }

    /**
     * MUST return an array
     *
     * formated as ['controller','method']
     *
     * or ['controller','method','params ...']
     *
     */
    private function getUrl(): array
    {
        $default_url = explode('/', $GLOBALS['DEFAULT_URL']);

        /**
         * $_GET['url'] can be:
         * - NULL
         * - controller
         * - controller/method
         * - controller/method/params...
         */
        if (isset($_GET['url'])) {

            $url = $_GET['url'];
            $url = trim($url, '/');
            $url = filter_var($url, FILTER_SANITIZE_URL);
            $url = explode('/', $url);

            if (sizeof($url) <= 2) {
                $url = [
                    (is_array($url) && isset($url[0]) ? $url[0] : $default_url[0]),
                    (is_array($url) && isset($url[1]) ? $url[1] : $default_url[1]),
                ];
            }

            return $url;
        }
        return $default_url;
    }

    /**
     * control access for URLs with:
     * - user $_SESSION['id'] set
     * - user $_SESSION['id'] not set
     *
     * ALSO reposnd with 404 page
     *
     * @param string $url formated as "Controller/Method"
     */
    private function access_control(string $url): void
    {

        $open_urls = [
            "pages/index",
            "pages/home",
            "pages/app",
            "pages/about",
            "pages/contact",
            "apis/contact",
            "apis/visit",
        ];

        $login_required_urls = [

        ];
        $login_required_fallbackpage = "pages/index";

        $no_login_required_urls = [

        ];
        $no_login_required_fallbackpage = "pages/index";

        if (in_array($url, $open_urls)) {
            return;
        }
        //*
        elseif (!isset($_SESSION['id']) && in_array($url, $login_required_urls)) {
            Utility::redirect($login_required_fallbackpage);
            die;
        }
        //*
        elseif (isset($_SESSION['id']) && !empty($_SESSION['id']) && in_array($url, $no_login_required_urls)) {
            Utility::redirect($no_login_required_fallbackpage);
            die;
        }
        //*
        elseif (!in_array($url, $login_required_urls) && !in_array($url, $no_login_required_urls)) {
            echo "Le lien est incorrect :/ <br> ERR_CODE 404";
            die;
        }
    }
}
