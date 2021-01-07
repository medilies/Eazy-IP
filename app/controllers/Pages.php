<?php
/**
 * Kinda loads HTML pages ith its related assets
 * Directly related with layout page
 */
class Pages extends Controller
{
    public function __construct()
    {

        if (isset($_SESSION['recorded_visit']) && $_SESSION['recorded_visit'] != true) {

            $db = parse_url(getenv("DATABASE_URL"));

            $cnx = new PDO("pgsql:" . sprintf(
                "host=%s;port=%s;user=%s;password=%s;dbname=%s",
                $db["host"],
                $db["port"],
                $db["user"],
                $db["pass"],
                ltrim($db["path"], "/")
            ));

            $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $cnx->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            $query = "INSERT INTO visitors (address) VALUES ('" . $_SERVER['REMOTE_ADDR'] . "')";

            $visit = $cnx->prepare($query);

            $visit->execute();

            $_SESSION['recorded_visit'] = true;
        }

    }

    public function index()
    {
        $data = [
            'title' => 'Home',
            'stylesheets_array' => ['home'],
            'scripts_array' => ['home_style'],
        ];
        $this->view('pages/home', $data);
    }

    public function app()
    {
        $data = [
            'title' => 'APP',
            'stylesheets_array' => ['app'],
            'scripts_array' => ["app", "app_style"],
        ];
        $this->view('pages/app', $data);

    }

    public function about()
    {
        $data = [
            'title' => 'About',
            'stylesheets_array' => [],
            'scripts_array' => [],
        ];
        $this->view('pages/about', $data);

    }

    public function contact()
    {
        $data = [
            'title' => 'Contact',
            'stylesheets_array' => [],
            'scripts_array' => ["contact"],
        ];
        $this->view('pages/contact', $data);
    }

    /**
     * Return Anchor element to be echoed in nav bar
     */
    protected function nav_element(string $id, string $class_list, string $href, string $textnode, string $fontawesome)
    {

        $element = "<a id='$id' class='$class_list' href='/$href'>";

        if ($fontawesome !== "") {
            $element .= "<i class='$fontawesome'></i> ";
        }
        $element .= "$textnode</a>";

        return $element;
    }

}
