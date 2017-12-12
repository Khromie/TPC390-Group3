<?php
require_once '_db.php';

$json = file_get_contents('php://input');
$params = json_decode($json);

class Result {}

$response = new Result();
if ($user != null) {
    $response->result = 'OK';
    $response->user = $user['name'];
    $response->message = 'Success';
}
else {
    $response->result = 'Unauthorized';
    $response->message = 'Invalid token';
}

header('Content-Type: application/json');
echo json_encode($response);

?>
