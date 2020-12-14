<?php
// add PDO that saves visitors in a DB to replace heroku paid metric

$db = parse_url(getenv("DATABASE_URL"));

$pdo = new PDO("pgsql:" . sprintf(
    "host=%s;port=%s;user=%s;password=%s;dbname=%s",
    $db["host"],
    $db["port"],
    $db["user"],
    $db["pass"],
    ltrim($db["path"], "/")
));

$data = $pdo->query("SELECT * FROM visitors")->fetch();
var_dump($data);

// INSERT INTO `visitors` (`moment`, `ip`) VALUES (current_timestamp(), '192.168.1.2');

require_once "./index.html";
