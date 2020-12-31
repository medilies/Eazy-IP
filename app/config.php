<?php
// E_ERROR | E_WARNING | E_PARSE | E_NOTICE | E_DEPRECATED ...
// error_reporting(0);
// error_reporting(E_ALL & ~E_NOTICE); // default in php.ini
error_reporting(E_ALL);

session_start();

// for includes
define('PROJECT_ROOT', dirname(__DIR__));
// for redirect and href ...
// !!! if URL_ROOT changes .htaccess file must be edited
$URL_ROOT = '';
$SITE_NAME = 'http://' . $_SERVER['SERVER_NAME'] . $URL_ROOT;
$APP_NAME = 'Eazy IP';

date_default_timezone_set('Africa/Algiers');

// webpages language for SEO
$LANG = 'en';

// fomated as "controller/method" + every controller MUST have an index() method
$DEFAULT_URL = "pages/index";
