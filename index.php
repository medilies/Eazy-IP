<?php
// add PDO that saves visitors in a DB to replace heroku paid metric

$db = parse_url(getenv("DATABASE_URL"));

echo $_SERVER['REMOTE_ADDR'] . "<br>";

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

$data = $pdo->query("SELECT * FROM visitors")->fetchAll();
print_r($data);

// INSERT INTO `visitors` (`moment`, `ip`) VALUES (current_timestamp(), '192.168.1.2');

require_once "./index.html";
