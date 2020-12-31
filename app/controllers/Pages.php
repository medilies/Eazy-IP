<?php
/**
 * Kinda loads HTML pages ith its related assets
 * Directly related with layout page
 */
class Pages extends Controller
{

    public function index()
    {
        $data = [
            'title' => 'APP',
            'stylesheets_array' => [],
            'scripts_array' => ["index", "style"],
        ];
        $this->view('pages/index', $data);
    }

    /**
     * Return Anchor element to be echoed in nav bar
     */
    protected function nav_element(string $id, string $class_list, string $href, string $textnode, string $fontawesome)
    {

        $element = "<a id='$id' class='$class_list'";

        if ($href !== "") {
            $element .= "href='";
            $element .= $GLOBALS['URL_ROOT'];
            $element .= "/$href'";
        }

        $element .= ">";

        if ($fontawesome !== "") {
            $element .= "<i class='$fontawesome'></i> ";
        }
        $element .= "$textnode</a>";

        return $element;
    }

}
