// Fungsi untuk memuat item menu dari database
async function loadMenuItems() {
    const menuItemsContainer = document.querySelector('.menu-items');
    menuItemsContainer.innerHTML = 'Loading menu items...'; // Tampilkan pesan loading

    try {
        const response = await fetch('get_menu.php'); // Ambil data dari PHP
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const menuItems = await response.json(); // Parsing respons JSON

        menuItemsContainer.innerHTML = ''; // Kosongkan container sebelum mengisi

        if (menuItems.length === 0) {
            menuItemsContainer.innerHTML = '<p>Tidak ada item menu yang tersedia.</p>';
        } else {
            menuItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item');
                itemDiv.innerHTML = `
                    <img src="Gambar/${item.gambar || 'placeholder.png'}" alt="${item.nama_item}">
                    <h3>${item.nama_item}</h3>
                    <p>${item.deskripsi}</p>
                    <p><strong>Harga:</strong> Rp ${parseInt(item.harga).toLocaleString('id-ID')}</p>
                    <div class="quantity-control">
                        <button onclick="kurangi(this)">-</button>
                        <input type="number" value="0" min="0" data-nama="${item.nama_item}" data-harga="${item.harga}">
                        <button onclick="tambah(this)">+</button>
                    </div>
                    <div class="admin-controls" style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                        <button class="edit-btn" data-id="${item.id}" data-nama="${item.nama_item}" data-deskripsi="${item.deskripsi}" data-harga="${item.harga}" data-gambar="${item.gambar}" style="padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                        <button class="delete-btn" data-id="${item.id}" style="padding: 8px 15px; background: #F44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
                    </div>
                `;
                menuItemsContainer.appendChild(itemDiv);
            });
        }
    } catch (error) {
        console.error('Gagal memuat item menu:', error);
        menuItemsContainer.innerHTML = '<p>Maaf, gagal memuat menu. Silakan coba lagi nanti.</p>';
    }
}

// Panggil fungsi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadMenuItems);


// Fungsi untuk menambah atau memperbarui item menu baru
document.getElementById('btn-add-item').addEventListener('click', async function() {
    const btn = this;
    const editingId = btn.dataset.editingId; // Periksa apakah kita dalam mode edit

    const namaItem = document.getElementById('add-nama-item').value;
    const deskripsi = document.getElementById('add-deskripsi').value;
    const harga = document.getElementById('add-harga').value;
    const gambarInput = document.getElementById('add-gambar'); // Ambil elemen input file
    const gambarFile = gambarInput.files[0]; // Ambil file pertama yang dipilih

    if (!namaItem || !harga) {
        alert("Nama item dan harga tidak boleh kosong!");
        return;
    }

    // Buat objek FormData
    const formData = new FormData();
    formData.append('nama_item', namaItem);
    formData.append('deskripsi', deskripsi);
    formData.append('harga', parseFloat(harga));
    if (gambarFile) { // Jika ada file gambar yang dipilih
        formData.append('gambar', gambarFile); // Tambahkan file ke FormData
    }
    
    let url = '';
    let successMessage = '';
    let errorMessage = '';

    if (editingId) {
        url = 'update_menu.php';
        formData.append('id', editingId); // Tambahkan ID untuk update
        successMessage = 'Item menu berhasil diperbarui!';
        errorMessage = 'Gagal memperbarui item: ';
    } else {
        url = 'add_menu.php';
        successMessage = 'Item menu berhasil ditambahkan!';
        errorMessage = 'Gagal menambah item: ';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            // Hapus baris 'Content-Type': 'application/json'
            // Browser akan secara otomatis mengatur Content-Type untuk FormData
            body: formData // Kirim FormData
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message); // Anda bisa mengganti ini dengan notifikasi yang lebih baik
            // Bersihkan form dan atur ulang tombol
            document.getElementById('add-nama-item').value = '';
            document.getElementById('add-deskripsi').value = '';
            document.getElementById('add-harga').value = '';
            document.getElementById('add-gambar').value = ''; // Reset input file
            // Reset tampilan nama file
            document.getElementById('file-name-display').textContent = 'Tidak ada file dipilih';
            btn.textContent = 'Tambah Menu';
            delete btn.dataset.editingId; // Hapus data-editingId
            loadMenuItems(); // Muat ulang menu setelah penambahan/pembaruan
            
            // Sembunyikan formulir setelah berhasil menambahkan/memperbarui
            const formContainer = document.getElementById('add-form-container');
            const toggleButton = document.getElementById('toggle-add-form');
            if (formContainer && toggleButton) {
                formContainer.classList.remove('visible-form-container');
                formContainer.classList.add('hidden-form-container');
                toggleButton.textContent = 'Tambah Menu Baru'; 
            }

        } else {
            alert(errorMessage + result.message); // Anda bisa mengganti ini dengan notifikasi yang lebih baik
        }
    } catch (error) {
        console.error('Error selama operasi menu:', error);
        alert('Terjadi kesalahan saat mencoba memproses item menu.');
    }
});


// Fungsi tambah dan kurangi yang sudah ada dari menu.html asli
function tambah(el){
    var input = el.parentNode.querySelector('input');
    input.value = parseInt(input.value) + 1;
}

function kurangi(el){
    var input = el.parentNode.querySelector('input');
    if(parseInt(input.value) > 0){
        input.value = parseInt(input.value) - 1;
    }
}

document.getElementById('pesan-sekarang').addEventListener('click', function(){
    var inputs = document.querySelectorAll('.menu-items input');
    var pesan = "Halo Banana King%0ASaya ingin memesan:%0A";
    var adaPesanan = false;
    var totalHargaKeseluruhan = 0;

    inputs.forEach(function(input){
        var jumlah = parseInt(input.value);
        if(jumlah > 0){
            adaPesanan = true;
            var nama = input.getAttribute('data-nama');
            var harga = parseFloat(input.getAttribute('data-harga'));
            var total = jumlah * harga;
            totalHargaKeseluruhan += total;
            pesan += "- " + nama + " (" + jumlah + " x Rp " + harga.toLocaleString('id-ID') + ") = Rp " + total.toLocaleString('id-ID') + "%0A";
        }
    });

    var note = document.getElementById('note').value;
    if(note){
        pesan += "%0ANote: " + encodeURIComponent(note);
    }

    if(adaPesanan){
        pesan += "%0ATotal Keseluruhan: Rp " + totalHargaKeseluruhan.toLocaleString('id-ID');
        window.open('https://wa.me/6282122339125?text=' + pesan, '_blank');
    } else {
        alert("Silakan pilih minimal 1 produk untuk dipesan.");
    }
});


// Kode untuk form kontak di index.html (jika ada, sesuaikan)
document.addEventListener('DOMContentLoaded', function() {
    const kirimWaButton = document.getElementById('kirim-wa');
    if (kirimWaButton) { // Pastikan tombol ada (hanya di index.html)
        kirimWaButton.addEventListener('click', function() {
            var nama = document.getElementById('nama').value;
            var email = document.getElementById('email').value;
            var pesan = document.getElementById('pesan').value;

            if(nama && email && pesan){
                var text = "Halo Banana King%0ASaya ingin memberikan saran.%0ANama: " + encodeURIComponent(nama) + "%0AEmail: " + encodeURIComponent(email) + "%0APesan: " + encodeURIComponent(pesan);
                window.open('https://wa.me/6281234567890?text=' + text, '_blank');
            } else {
                alert("Mohon isi semua kolom sebelum mengirim.");
            }
        });
    }
});

// Event listener untuk tombol edit dan delete (menggunakan delegasi event)
document.querySelector('.menu-items').addEventListener('click', function(event) {
    // Handle Edit button click
    if (event.target.classList.contains('edit-btn')) {
        const btn = event.target;
        const id = btn.dataset.id;
        const nama = btn.dataset.nama;
        const deskripsi = btn.dataset.deskripsi;
        const harga = btn.dataset.harga;
        const gambar = btn.dataset.gambar; // Ambil nama gambar yang sudah ada dari dataset

        // Tampilkan formulir
        const formContainer = document.getElementById('add-form-container');
        const toggleButton = document.getElementById('toggle-add-form');
        if (formContainer && toggleButton) {
            formContainer.classList.remove('hidden-form-container');
            formContainer.classList.add('visible-form-container');
            toggleButton.textContent = 'Sembunyikan Formulir'; 
        }

        // Isi formulir dengan data item yang akan diedit
        document.getElementById('add-nama-item').value = nama;
        document.getElementById('add-deskripsi').value = deskripsi;
        document.getElementById('add-harga').value = harga;
        
        // Atur tampilan nama file yang sudah ada
        const fileNameDisplay = document.getElementById('file-name-display');
        if (fileNameDisplay) {
            fileNameDisplay.textContent = gambar || 'Tidak ada file dipilih'; // Tampilkan nama gambar lama
        }
        document.getElementById('add-gambar').value = ''; // Kosongkan input file asli untuk upload baru

        // Ubah tombol tambah menjadi tombol update
        const addItemBtn = document.getElementById('btn-add-item');
        addItemBtn.textContent = 'Update Menu';
        addItemBtn.dataset.editingId = id; // Simpan ID item yang sedang diedit
    }

    // Handle Delete button click
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.dataset.id; 
        if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            (async () => {
                try {
                    const response = await fetch('delete_menu.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: id })
                    });
                    const result = await response.json();

                    if (result.success) {
                        alert(result.message); // Ganti dengan notifikasi yang lebih baik
                        loadMenuItems(); // Muat ulang menu
                    } else {
                        alert("Gagal menghapus item: " + result.message); // Ganti dengan notifikasi yang lebih baik
                    }
                } catch (error) {
                    console.error('Error saat menghapus item menu:', error);
                    alert('Terjadi kesalahan saat mencoba menghapus item menu.');
                }
            })();
        }
    }
});

// JavaScript untuk menampilkan/menyembunyikan formulir dan mengelola input file kustom
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-add-form');
    const formContainer = document.getElementById('add-form-container');
    const fileInput = document.getElementById('add-gambar'); // Ambil input file
    const fileNameDisplay = document.getElementById('file-name-display'); // Ambil span untuk menampilkan nama file

    // Inisialisasi awal formulir (tersembunyi) dan tombol
    if (formContainer) {
        formContainer.classList.add('hidden-form-container'); // Pastikan tersembunyi di awal
    }
    if (toggleButton) {
        toggleButton.textContent = 'Tambah Menu Baru'; // Pastikan teks awal benar
    }


    if (toggleButton && formContainer) {
        toggleButton.addEventListener('click', function() {
            if (formContainer.classList.contains('hidden-form-container')) {
                formContainer.classList.remove('hidden-form-container');
                formContainer.classList.add('visible-form-container');
                toggleButton.textContent = 'Sembunyikan Formulir'; // Ubah teks tombol
            } else {
                formContainer.classList.remove('visible-form-container');
                formContainer.classList.add('hidden-form-container');
                toggleButton.textContent = 'Tambah Menu Baru'; // Ubah teks tombol
                // Bersihkan formulir saat disembunyikan
                document.getElementById('add-nama-item').value = '';
                document.getElementById('add-deskripsi').value = '';
                document.getElementById('add-harga').value = '';
                if (fileInput) { // Pastikan elemen ada sebelum diakses
                    fileInput.value = ''; 
                }
                if (fileNameDisplay) { // Pastikan elemen ada sebelum diakses
                    fileNameDisplay.textContent = 'Tidak ada file dipilih'; 
                }
                // Reset status tombol ke "Tambah Menu" (bukan "Update Menu")
                const addItemBtn = document.getElementById('btn-add-item');
                addItemBtn.textContent = 'Tambah Menu';
                delete addItemBtn.dataset.editingId;
            }
        });
    }

    // Event listener untuk memperbarui nama file yang dipilih pada input file kustom
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name; // Tampilkan nama file yang dipilih
            } else {
                fileNameDisplay.textContent = 'Tidak ada file dipilih'; // Jika tidak ada file dipilih
            }
        });
    }
});