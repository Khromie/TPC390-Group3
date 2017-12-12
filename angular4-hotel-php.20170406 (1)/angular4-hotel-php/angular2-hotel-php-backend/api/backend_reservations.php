<?php
require_once '_db.php';

validate_request();

$json = file_get_contents('php://input');
$params = json_decode($json);

$stmt = $db->prepare("SELECT * FROM reservation WHERE NOT ((end <= :start) OR (start >= :end))");
$stmt->bindParam(':start', $params->start);
$stmt->bindParam(':end', $params->end);
$stmt->execute();
$result = $stmt->fetchAll();

class Event {}
$events = array();

$now = new DateTime("now");
$today = $now->setTime(0, 0, 0);

foreach($result as $row) {
    $e = new Event();
    $e->id = $row['id'];
    $e->text = $row['name'];
    $e->start = $row['start'];
    $e->end = $row['end'];
    $e->resource = $row['room_id'];
    $e->bubbleHtml = "Reservation details: <br/>".$e->text;
    
    // additional properties
    $e->status = $row['status'];
    $e->paid = $row['paid'];
    $events[] = $e;
}

header('Content-Type: application/json');
echo json_encode($events);

?>
