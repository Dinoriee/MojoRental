<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'koneksi.php';

// Gunakan $_POST agar bisa menerima FormData
$id = $_POST['id'];
$name = $_POST['name'];
$brand = $_POST['brand'];
$plate = $_POST['plate_number'];
$price = $_POST['price_per_day'];
$type = $_POST['type'];

// Logika Update Gambar
$image_query_part = "";
$params = [$name, $brand, $plate, $price, $type];
$types = "sssds"; 

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $target_dir = "C:/xampp/htdocs/MojoRental1/MojoRent/images/";
    if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);

    $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
    $new_filename = time() . "_" . uniqid() . "." . $file_extension;
    $target_file = $target_dir . $new_filename;

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $image_query_part = ", image_url=?"; // Update kolom image_url
        $params[] = $new_filename;
        $types .= "s";
    }
}

$params[] = $id;
$types .= "i";

$sql = "UPDATE vehicles SET name=?, brand=?, plate_number=?, price_per_day=?, type=? $image_query_part WHERE id=?";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>