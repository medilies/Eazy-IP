<?php
/**
 * libraries autoloader
 */

spl_autoload_register(function ($class_name) {
    if (file_exists(PROJECT_ROOT . '/app/libraries/' . $class_name . '.php')) {
        require_once PROJECT_ROOT . '/app/libraries/' . $class_name . '.php';
    } elseif (file_exists(PROJECT_ROOT . '/app/helpers/' . $class_name . '.php')) {
        require_once PROJECT_ROOT . '/app/helpers/' . $class_name . '.php';
    }
});
