# Panduan Deployment Gratis RiceGuardAI (Laravel + React + FastAPI)

Karena proyek ini menggunakan perpaduan antara **PHP (Laravel)**, **Node.js (React/Vite)**, dan **Python (AI Service)**, kita tidak bisa men-deploy semuanya di satu tempat gratisan (seperti Vercel). Kita harus menggunakan arsitektur **Microservices**.

Berikut adalah alur *deployment* yang kami rekomendasikan, 100% gratis.

---

## Persiapan Awal di GitHub
Pastikan seluruh source code Anda sudah didorong (*push*) ke **GitHub**. 
Akan sangat mempermudah proses jika Anda memisahkan platform AI dengan Web menjadi 2 repositori:
1.  **Repository Web** (`riceguard-web`): Berisi seluruh folder Laravel (`app`, `resources`, `routes`, dll) *kecuali* folder `ai-service`.
2.  **Repository AI** (`riceguard-ai`): Hanya berisi isi dari dalam folder `ai-service/` (dimana file `Dockerfile` harus berada di akar/root repository).

---

## 🚀 Tahap 1: Hosting Database (Supabase)
Karena hosting aplikasi web gratis biasanya tidak memberikan *database persisten*, kita akan menggunakan Supabase untuk database MySQL/PostgreSQL gratis.

1.  Buka web [Supabase](https://supabase.com/).
2.  Klik **Start your project** dan daftar menggunakan GitHub.
3.  Klik **New Project**, beri nama (misal: `riceguard-db`), dan buatkan _Database Password_ (simpan baik-baik password ini).
4.  Tunggu beberapa menit hingga database selesai dibuat.
5.  Masuk ke ikon **Settings (Gerigi)** > **Database**.
6.  Gulir ke bawah pada bagian **Connection String** > **URI**. 
7.  Salin link `postgresql://...` yang diberikan (Anda akan sangat membutuhkannya nanti untuk file `.env` Laravel).

*Catatan: Supabase menggunakan PostgreSQL. Pastikan Anda tidak memiliki kode *raw query* spesifik MySQL di Laravel. Laravel ORM/Eloquent langsung otomatis menangani perbedaan MySQL dan PostgreSQL.*

---

## 🧠 Tahap 2: Hosting AI Service Python (Hugging Face Spaces)
File `Dockerfile` di folder `ai-service` Anda sudah tersetting sangat baik pada Port 7860, port ini persis standar yang ditetapkan oleh platform AI ternama *Hugging Face*.

1.  Daftar akun di [Hugging Face](https://huggingface.co/).
2.  Di bagian sudut kanan atas (ikon profil Anda), klik **New Space**.
3.  Isi formular instalasi:
    *   **Space Name:** `ai-riceguard`
    *   **License:** Opsional (pilih `mit` atau lewati saja).
    *   **Select the Space SDK:** Pilih tombol **Docker** >> lalu pilih opsi **Blank**.
    *   **Space Hardware:** Pilih **Free (CPU basic)**.
4.  Klik **Create Space**.
5.  Sekarang Anda akan memiliki Space kosong. Anda punya 2 pilihan cara mengupload folder AI Anda:
    *   Menguploadnya ke GitHub lalu menyambungkan GitHub Repository tersebut ke Hugging Face (sangat direkomendasikan).
    *   Atau secara manual masuk ke tab **Files** di Space tersebut, klik **Add file** -> **Upload files**, dan upload *"semua"* isi folder `ai-service/` (termasuk isi folder modelnya dan datasetnya jika diperlukan).
6.  *Hugging Face* akan mendeteksi *Dockerfile* bawaan proyek Anda dan **Otomatis Melakukan Proses Build**.
7.  Tunggu hingga status "Building" berubah menjadi **Running**.
8.  Klik logo *titik tiga* di menu sebelah kanan atas -> pilih **Embed this space** -> Pada tulisan *Direct URL*, **Salin link tersebut**. Link itu adalah Host AI Anda (Kira-kira seperti ini: `https://username-ai-riceguard.hf.space`).

---

## 🌐 Tahap 3: Hosting Web App Laravel (Render.com)
Sekarang AI dan Databasenya sudah online, langkah terakhir adalah hosting website utamanya agar bisa tersambung ke Database dan AI yang baru saja kita onlinekan.

1.  Buka [Render.com](https://render.com/) dan masuk menggunakan akun GitHub Anda.
2.  Di layar utama (Dashboard), klik tombol **New +** dan pilih **Web Service**.
3.  Pilih **Build and deploy from a Git repository**, lalu sambungkan ke repositori `riceguard-web` GitHub Anda. 
4.  Isi konfigurasi berikut:
    *   **Name:** `riceguard-app`
    *   **Region:** Pilih lokasi server yang paling dekat (misal: Singapore).
    *   **Environment:** Pilih **PHP**
    *   **Build Command:** 
        `curl -s https://getcomposer.org/installer | php && php composer.phar install --no-dev --optimize-autoloader && npm install && npm run build`
    *   **Start Command:**
        Render harus dijalankan di folder `public`, jadi ketikkan ini: 
        `cd public && php -S 0.0.0.0:$PORT`
5.  Gulir ke bawah dan cari pengaturan **Environment Variables** (ini peranan file `.env` Laravel). Klik **Add Environment Variable** dan isi dengan format persis seperti di Laravel Anda:
    *   `PORT` = `8000` (wajib diisi agar Render tahu host mana)
    *   `APP_NAME` = `RiceGuardAI`
    *   `APP_ENV` = `production`
    *   `APP_KEY` = *(Masukkan value APP_KEY dari .env pada PC Anda!)*
    *   `APP_DEBUG` = `false`
    *   `APP_URL` = *(Akan diisi URL hasil akhir server Anda di Render nanti)*
    *   `AI_SERVICE_URL` = *(Masukkan link Host AI HF Space dari Tahap 2 disini)*
    *   **(Database Env):** Karena Render tidak ada setting DB ganda seperti di .env, masukan saja bagian connection URI PostgreSQL dari Supabase (Tahap 1):
        *   `DB_CONNECTION` = `pgsql`
        *   `DATABASE_URL` = *(Masukkan isi URI Supabase `postgresql://postgres:pass...` dari awal)*
6.  Di bagian paling bawah, pilih paket **Free**, lalu klik tombol **Create Web Service**.

> **💡 PENTING SAAT DEPLOYMENT RENDER**
> Jika Anda mengalami masalah saat instalasi atau saat *Build Command*, karena file Laravel menggunakan Node.js untuk React, bisa jadi versi Node asli yang ada di Render kurang pas. Jika butuh versi node terbaru, Render punya `.node-version` config.

### Selesai!
Ketiga sistem (Database, Backend AI, Frontend/Backend Website) sudah saling tersambung. Anda sudah bisa mengakses URL publik aplikasi web yang dihasilkan Render, yang secara otomatis memanggil Model *FastAPI* yang ada di HuggingFace, lalu menyimpan respons/record di Database Server Supabase.
