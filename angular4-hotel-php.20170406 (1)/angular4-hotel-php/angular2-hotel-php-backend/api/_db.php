<?php
$host = "127.0.0.1";
$port = 3307;
$username = "local";
$password = "local";
$database = "hotel";   // the database will be created if it doesn't exist

date_default_timezone_set("UTC");

$db = new PDO("mysql:host=$host;port=$port",
    $username,
    $password);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("CREATE DATABASE IF NOT EXISTS `$database`");
$db->exec("use `$database`");

function tableExists($dbh, $id)
{
    $results = $dbh->query("SHOW TABLES LIKE '$id'");
    if(!$results) {
        return false;
    }
    if($results->rowCount() > 0) {
        return true;
    }
    return false;
}

$exists = tableExists($db, "room");

if (!$exists) {
    //create the database
    $db->exec("CREATE TABLE IF NOT EXISTS room (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        name TEXT, 
                        capacity INTEGER,
                        status VARCHAR(30))");

    $db->exec("CREATE TABLE IF NOT EXISTS reservation (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        name TEXT, 
                        start DATETIME, 
                        end DATETIME,
                        room_id INTEGER,
                        status VARCHAR(30),
                        paid INTEGER)");

    $db->exec("CREATE TABLE IF NOT EXISTS user (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        name TEXT,
                        password TEXT)");

    $db->exec("CREATE TABLE IF NOT EXISTS user_token (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                        user_id INTEGER,
                        created DATETIME,
                        expires DATETIME,
                        token VARCHAR(64))");


    $rooms = array(
        array('name' => 'Room 1',
            'capacity' => 2,
            'status' => 'Dirty'),
        array('name' => 'Room 2',
            'capacity' => 2,
            'status' => "Cleanup"),
        array('name' => 'Room 3',
            'capacity' => 2,
            'status' => "Ready"),
        array('name' => 'Room 4',
            'capacity' => 4,
            'status' => "Ready"),
        array('name' => 'Room 5',
            'capacity' => 1,
            'status' => "Ready")
    );

    $insert = "INSERT INTO room (name, capacity, status) VALUES (:name, :capacity, :status)";
    $stmt = $db->prepare($insert);

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':capacity', $capacity);
    $stmt->bindParam(':status', $status);

    foreach ($rooms as $r) {
        $name = $r['name'];
        $capacity = $r['capacity'];
        $status = $r['status'];
        $stmt->execute();
    }

    $users = array(
        array('name' => 'admin',
            'password' => password_hash('admin', PASSWORD_BCRYPT, ['cost' => 11]))
    );

    $insert = "INSERT INTO user (name, password) VALUES (:name, :password)";
    $stmt = $db->prepare($insert);

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':password', $password);

    foreach ($users as $r) {
        $name = $r['name'];
        $password = $r['password'];
        $stmt->execute();
    }

}

$user = user();

function generate_random() {
    return bin2hex(random_bytes(32));
}

function user() {
    if (empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        return null;
    }
    $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
    global $db;

    $now = new DateTime();
    $now_string = $now->format("Y-m-d\\TH:i:s");

    $stmt = $db->prepare('SELECT user.* FROM user_token JOIN user ON user_token.user_id = user.id WHERE token = :token AND expires > :now');
    $stmt->bindParam(':token', $token);
    $stmt->bindParam(':now', $now_string);
    $stmt->execute();
    return $stmt->fetch();
}

function is_valid_user() {
    global $user;
    return $user != null;
}

function validate_request() {
    is_valid_user() or die("Unauthorized");
}

?>