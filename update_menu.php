<?php
// update_menu.php

header('Content-Type: application/json');
include 'db_config.php'; // Memasukkan file konfigurasi database Anda

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $nama_item = $_POST['nama_item'] ?? '';
    $deskripsi = $_POST['deskripsi'] ?? '';
    $harga = floatval($_POST['harga'] ?? 0);

    $gambar_nama_file = ''; // Akan menyimpan nama file gambar baru atau yang sudah ada

    // Dapatkan nama gambar lama jika ada, untuk kasus update tanpa unggah gambar baru
    $query_old_image = $conn->prepare("SELECT gambar FROM menu_items WHERE id = ?");
    $query_old_image->bind_param("i", $id);
    $query_old_image->execute();
    $result_old_image = $query_old_image->get_result();
    $old_image_row = $result_old_image->fetch_assoc();
    $old_gambar_nama_file = $old_image_row['gambar'] ?? '';
    $query_old_image->close();

    // Tangani unggahan file baru (jika ada)
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        $file_tmp_name = $_FILES['gambar']['tmp_name'];
        $file_name = $_FILES['gambar']['name'];
        $file_size = $_FILES['gambar']['size'];
        $file_type = $_FILES['gambar']['type'];

        // Dapatkan ekstensi file
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Buat nama file unik untuk menghindari tabrakan
        $gambar_nama_file = uniqid('img_') . '.' . $file_ext;
        $upload_dir = __DIR__ . '/Gambar/';

        // Buat direktori Gambar jika belum ada
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $upload_path = $upload_dir . $gambar_nama_file;

        if (!move_uploaded_file($file_tmp_name, $upload_path)) {
            $response['message'] = 'Gagal memindahkan file gambar baru yang diunggah.';
            echo json_encode($response);
            $conn->close();
            exit();
        }

        // Opsional: Hapus gambar lama dari server jika ada gambar baru yang diunggah
        if ($old_gambar_nama_file && file_exists($upload_dir . $old_gambar_nama_file)) {
            unlink($upload_dir . $old_gambar_nama_file);
        }

    } else {
        // Jika tidak ada gambar baru diunggah di formulir,
        // gunakan nama gambar lama yang sudah ada di database.
        $gambar_nama_file = $old_gambar_nama_file;
    }


    // Validasi input
    if (empty($id) || empty($nama_item) || $harga <= 0) {
        $response['message'] = 'ID, nama item, dan harga tidak boleh kosong, dan harga harus lebih dari 0.';
    } else {
        $stmt = $conn->prepare("UPDATE menu_items SET nama_item = ?, deskripsi = ?, harga = ?, gambar = ? WHERE id = ?");
        $stmt->bind_param("ssdis", $nama_item, $deskripsi, $harga, $gambar_nama_file, $id);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Item menu berhasil diperbarui.';
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