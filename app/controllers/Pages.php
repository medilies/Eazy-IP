<?php
/**
 * Kinda loads HTML pages ith its related assets
 * Directly related with layout page
 */
class Pages extends Controller
{
    public function __construct()
    {
        // do the visitors thingy
    }

    public function index()
    {
        $data = [
            'title' => 'APP',
            'stylesheets_array' => ['app'],
            'scripts_array' => ["app", "app_style"],
        ];
        $this->view('pages/index', $data);
    }

    public function home()
    {
        $data = [
            'title' => 'APP',
            'stylesheets_array' => ['home'],
            'scripts_array' => ['home_style'],
        ];
        $this->view('pages/home', $data);
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
