<?php
// add PDO that saves visitors in a DB to replace heroku paid metric

// $dbopts = parse_url(getenv('DATABASE_URL'));
// $app->register(new Csanquer\Silex\PdoServiceProvider\Provider\PDOServiceProvider('pdo'),
//     array(
//         'pdo.server' => array(
//             'driver' => 'pgsql',
//             'user' => $dbopts["user"],
//             'password' => $dbopts["pass"],
//             'host' => $dbopts["host"],
//             'port' => $dbopts["port"],
//             'dbname' => ltrim($dbopts["path"], '/'),
//         ),
//     )
// );

// $st = $app['pdo']->prepare('SELECT timestamp FROM visitors');
// $st->execute();

// $names = array();
// while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
//     $names[] = $row;
// }

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
