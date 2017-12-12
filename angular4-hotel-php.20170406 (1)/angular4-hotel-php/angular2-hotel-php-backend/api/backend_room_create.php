<?php
require_once '_db.php';

validate_request();

$json = file_get_contents('php://input');
$params = json_decode($json);

$stmt = $db->prepare("INSERT INTO room (name, capacity, status) VALUES (:name, :capacity, 'Ready')");
$stmt->bindParam(':name', $params->name);
$stmt->bindParam(':capacity', $params->capacity);
$stmt->execute();

class Result {}

$response = new Result();
$response->result = 'OK';
$response->message = 'Created with id: '.$db->lastInsertId();
$response->id = $db->lastInsertId();

header('Content-Type: application/json');
echo json_encode($response);

?>
