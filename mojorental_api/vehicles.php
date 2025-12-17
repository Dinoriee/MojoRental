<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'koneksi.php';

$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
// Sesuaikan path 
$base_image_url = "$protocol://$host/MojoRental1/MojoRent/images/"; 

$sql = "SELECT * FROM vehicles ORDER BY id DESC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    if (!empty($row['image_url'])) {
        $row['image_url'] = $base_image_url . $row['image_url'];
    } else {
        $row['image_url'] = "https://via.placeholder.com/150"; 
    }
    $data[] = $row;
}

echo json_encode($data);
?>