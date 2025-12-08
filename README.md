# 🌡️ Smart DHT22 Web Monitoring
### by Azka Jalaludin Hail  
**SMK Mitra Industri MM2100 – Kelas X TITL 2**  

📅 
*Project dimulai: 11 November 2025*
*Project selesai: 8 Desember 2025*



---

## 📘 Tentang Project

**Smart DHT22 Web Monitoring** adalah proyek berbasis **mikrokontroler Wemos D1 Mini (ESP8266)** yang berfungsi untuk **mendeteksi suhu dan kelembapan ruangan secara realtime** menggunakan sensor **DHT22**.  

Data sensor dikirim melalui server web lokal yang dihosting oleh Wemos, lalu ditampilkan dalam bentuk **grafik interaktif** pada website yang bisa diakses dari **smartphone atau komputer** yang terhubung pada jaringan WiFi yang sama.

Selain itu, proyek ini juga dilengkapi dengan sistem deteksi:
- ⚠️ **Sensor Error** — menampilkan pesan khusus jika sensor DHT22 tidak terpasang atau tidak terbaca.  
- 📊 **Grafik Realtime** — menampilkan perubahan suhu dan kelembapan dalam bentuk chart yang dinamis.  
- 💡 **Tampilan Responsif** — web otomatis menyesuaikan tampilan untuk layar HP maupun laptop.

---

## ⚙️ Teknologi yang Digunakan

### 🧠 Hardware:
- **Wemos D1 Mini (ESP8266)**  
- **Sensor DHT22**  
- **Beberapa LED indikator (Opsional)**

### 💻 Software:
- **Arduino IDE**  
- **HTML, CSS, JavaScript (Frontend)**  
- **Chart.js** untuk grafik realtime  
- **Vercel** untuk hosting web  
- **GitHub** untuk penyimpanan kode sumber  
- **FireBase** untuk penyimpanan database realtime

---

## 📡 Cara Kerja Singkat

1. Wemos membaca suhu dan kelembapan dari sensor DHT22.  
2. Nilai tersebut disajikan melalui server FireBase.  
3. Website yang dihosting di Vercel mengambil data tersebut menggunakan AJAX/Fetch API.  
4. Data ditampilkan dalam bentuk angka dan grafik realtime.  

---

## 🚀 Cara Menggunakan

1. Upload file `wemos_dht22.ino` ke Wemos D1 Mini melalui **Arduino IDE**.  
2. Ubah SSID dan Password sesuai WiFi yang kamu inginkan.  
3. Jalankan Wemos dan lihat **API KEY** dan **DATABASE_URL** pada Serial Monitor.  
4. Buka website di browser dan masukkan **API KEY** dan **DATABASE_URL**:
5. Selesai! 🎉 Data suhu dan kelembapan akan tampil otomatis di web.

---

## 🧑‍💻 Pengembang
**Nama:** Azka Jalaludin Hail  
**Sekolah:** SMK Mitra Industri MM2100  
**Kelas:** X TITL 2  
📅 *Proyek dimulai pada 11 November 2025*

---

## 💬 Tujuan Pembelajaran
Proyek ini bertujuan untuk:
- Melatih kemampuan dalam **mikrokontroler dan IoT (Internet of Things)**.  
- Mengenal cara **menghubungkan hardware dengan web**.  
- Mengembangkan **tampilan antarmuka interaktif** untuk sistem monitoring.  
- Mempersiapkan siswa menghadapi era **Smart System & Automation** di dunia industri.

---

## 🏁 Rencana Pengembangan Selanjutnya
- Menambahkan **notifikasi suhu ekstrem** lewat Telegram atau Email.  
- Menyimpan data historis ke **database online** (misalnya Firebase).  
- Menambahkan **fitur kontrol jarak jauh** untuk kipas pendingin otomatis.

---

✨ *“Teknologi tidak hanya tentang alat, tapi bagaimana alat itu mempermudah hidup kita.”*  
— Azka Jalaludin Hail

