<?php
require_once '_db.php';

validate_request();

$json = file_get_contents('php://input');
$params = json_decode($json);

// make sure it's the check-in time
$start = new DateTime($params->start);
$start->setTime(12, 0, 0);
$start_string = $start->format("Y-m-d\\TH:i:s");

// make sure it's the check-out time
$end = new DateTime($params->end);
$end->setTime(12, 0, 0);
$end_string = $end->format("Y-m-d\\TH:i:s");

$stmt = $db->prepare("INSERT INTO reservation (name, start, end, room_id, status, paid) VALUES (:name, :start, :end, :room, 'New', 0)");
$stmt->bindParam(':start', $start_string);
$stmt->bindParam(':end', $end_string);
$stmt->bindParam(':name', $params->name);
$stmt->bindParam(':room', $params->room);
$stmt->execute();

class Result {}

$response = new Result();
$response->result = 'OK';
$response->message = 'Created with id: '.$db->lastInsertId();
$response->id = $db->lastInsertId();


header('Content-Type: application/json');
echo json_encode($response);

?>
