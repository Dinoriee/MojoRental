<?php
// htdocs/mojorental/api/rentals.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'koneksi.php';

$user_id = $_GET['user_id'] ?? 0;
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$base_image_url = "$protocol://$host/MojoRental1/MojoRent/images/";

// UBAH DISINI: Ambil vehicles.image_url
$sql = "SELECT rentals.*, vehicles.name as vehicle_name, vehicles.brand, vehicles.image_url 
        FROM rentals 
        JOIN vehicles ON rentals.vehicle_id = vehicles.id 
        WHERE rentals.user_id = ? 
        ORDER BY rentals.id DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    // Format URL gambar untuk history
    if (!empty($row['image_url'])) {
        $row['image_url'] = $base_image_url . $row['image_url'];
    } else {
        $row['image_url'] = null;
    }
    $data[] = $row;
}

echo json_encode($data);
?>