<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'koneksi.php';

if (empty($_POST) && empty($_FILES)) {
    echo json_encode(["status" => "error", "message" => "File terlalu besar! Data POST kosong. Cek post_max_size di php.ini"]);
    exit;
}

$name = $_POST['name'] ?? '';
$brand = $_POST['brand'] ?? '';
$plate = $_POST['plate_number'] ?? '';
$price = $_POST['price_per_day'] ?? 0;
$type = $_POST['type'] ?? '';
$image_url = ""; 

if (isset($_FILES['image'])) {
    $error_code = $_FILES['image']['error'];
    
    if ($error_code !== UPLOAD_ERR_OK) {
        $messages = [
            1 => "File melebihi upload_max_filesize di php.ini",
            2 => "File melebihi batas form (MAX_FILE_SIZE)",
            3 => "File hanya terupload sebagian",
            4 => "Tidak ada file yang diupload",
            6 => "Folder temporary hilang",
            7 => "Gagal menulis ke disk",
            8 => "Upload dihentikan oleh ekstensi PHP"
        ];
        $msg = $messages[$error_code] ?? "Unknown Error";
        
        echo json_encode(["status" => "error", "message" => "Gagal Upload: $msg"]);
        exit;
    }


    $target_dir = "C:/xampp/htdocs/MojoRental1/MojoRent/images/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
    $new_filename = time() . "_" . uniqid() . "." . $file_extension;
    $target_file = $target_dir . $new_filename;

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $image_url = $new_filename; 
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal memindahkan file ke folder images. Cek permission folder."]);
        exit;
    }
}

// SIMPAN KE DATABASE
$sql = "INSERT INTO vehicles (name, brand, plate_number, price_per_day, type, status, image_url) VALUES (?, ?, ?, ?, ?, 'available', ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssdss", $name, $brand, $plate, $price, $type, $image_url);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $stmt->error]);
}
?>