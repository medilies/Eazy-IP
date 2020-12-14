<?php
// add PDO that saves visitors in a DB to replace heroku paid metric

$db = parse_url(getenv("DATABASE_URL"));

try {
    $pdo = new PDO("pgsql:" . sprintf(
        "host=%s;port=%s;user=%s;password=%s;dbname=%s",
        $db["host"],
        $db["port"],
        $db["user"],
        $db["pass"],
        ltrim($db["path"], "/")
    ));

    $pdo->exec("INSERT INTO visitors (address) VALUES ('" . $_SERVER['REMOTE_ADDR'] . "')");

} catch (PDOException $e) {
    echo "Error!: " . $e->getMessage() . "<br/>";
}

require_once "./index.html";
