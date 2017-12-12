<?php
require_once '_db.php';

$json = file_get_contents('php://input');
$params = json_decode($json);

$stmt = $db->prepare('SELECT * FROM user WHERE name = :name');
$stmt->bindParam(':name', $params->username);
$stmt->execute();
$user = $stmt->fetch();

$found = $user != null;

class Result {}

if (!$found) {
    failed();
}

if (!password_verify($params->password, $user['password'])) {
    failed();
}

$token = generate_random();

$now = new DateTime();
$expires = clone $now;
$expires->add(new DateInterval("P7D"));  // token expires in 7 days

$now_string = $now->format("Y-m-d\\TH:i:s");
$expires_string = $expires->format("Y-m-d\\TH:i:s");

$stmt = $db->prepare('INSERT INTO user_token (user_id, created, expires, token) VALUES (:id, :created, :expires, :token)');
$stmt->bindParam(':id', $user['id']);
$stmt->bindParam(':created', $now_string);
$stmt->bindParam(':expires', $expires_string);
$stmt->bindParam(':token', $token);
$stmt->execute();


$response = new Result();
$response->result = 'OK';
$response->user = new Result();
$response->user->name = $user['name'];
$response->user->token = $token;
$response->message = 'Success';

header('Content-Type: application/json');
echo json_encode($response);


function failed() {
    $response = new Result();
    $response->result = 'Failure';
    $response->message = 'Invalid login: '.$user;

    header('Content-Type: application/json');
    echo json_encode($response);
    die;
}
?>
