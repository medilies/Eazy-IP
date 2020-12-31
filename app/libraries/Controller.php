<?php
/*
 * Base Controller
 * Loads the models and views
 */
class Controller
{
    /**
     * loads model for database use
     *
     * @param string $model name of Class and its file
     *
     * @param string $connections precise Db users needed according to operations privileges
     */
    protected function model(string $model)
    {
        // Require model file
        require_once '../app/models/' . $model . '.php';

        // Instatiate model
        return new $model();
    }

    /**
     * loads view
     *
     * @param string $view name of static file
     * @param array data dynamic part in the view
     */
    protected function view(string $view, array $data = []): void
    {
        // Check for view file
        if (file_exists('../app/views/' . $view . '.php')) {
            require_once '../app/views/' . $view . '.php';
        } else {
            // View does not exist
            die('View does not exist');
        }
    }
}
