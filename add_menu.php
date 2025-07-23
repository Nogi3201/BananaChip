<?php
// add_menu.php

header('Content-Type: application/json');
include 'db_config.php'; // Memasukkan file konfigurasi database Anda

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Data teks dari $_POST
    $nama_item = $_POST['nama_item'] ?? '';
    $deskripsi = $_POST['deskripsi'] ?? '';
    $harga = floatval($_POST['harga'] ?? 0); // Pastikan dikonversi ke float

    $gambar_nama_file = ''; // Inisialisasi nama file gambar

    // Tangani unggahan file
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        $file_tmp_name = $_FILES['gambar']['tmp_name'];
        $file_name = $_FILES['gambar']['name'];
        $file_size = $_FILES['gambar']['size'];
        $file_type = $_FILES['gambar']['type'];

        // Dapatkan ekstensi file
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Buat nama file unik untuk menghindari tabrakan
        $gambar_nama_file = uniqid('img_') . '.' . $file_ext;
        $upload_dir = __DIR__ . '/Gambar/'; // Direktori Gambar relatif terhadap lokasi file PHP ini

        // Buat direktori Gambar jika belum ada
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $upload_path = $upload_dir . $gambar_nama_file;

        // Pindahkan file yang diunggah dari direktori sementara ke direktori Gambar
        if (!move_uploaded_file($file_tmp_name, $upload_path)) {
            $response['message'] = 'Gagal memindahkan file yang diunggah.';
            echo json_encode($response);
            $conn->close();
            exit();
        }
    }

    // Validasi input
    // Pastikan harga tidak 0 atau negatif setelah floatval
    if (empty($nama_item) || $harga <= 0) {
        $response['message'] = 'Nama item dan harga tidak boleh kosong dan harga harus lebih dari 0.';
    } else {
        $stmt = $conn->prepare("INSERT INTO menu_items (nama_item, deskripsi, harga, gambar) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssds", $nama_item, $deskripsi, $harga, $gambar_nama_file);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Item menu berhasil ditambahkan.';
            $response['id'] = $conn->insert_id;
        } else {
            $response['message'] = 'Error: ' . $stmt->error;
        }
        $stmt->close();
    }
} else {
    $response['message'] = 'Metode request tidak valid.';
}

echo json_encode($response);
$conn->close();
?>