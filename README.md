# 🌾 RiceGuardAI

Sistem AI berbasis web untuk klasifikasi penyakit tanaman padi dari gambar daun. Menggunakan **transfer learning MobileNetV2** untuk mendeteksi 4 kelas:

- ✅ **Healthy** (Sehat)
- 🍂 **Leaf Blast** (Blas Daun)
- 🟤 **Brown Spot** (Bercak Coklat)
- 🦠 **Bacterial Leaf Blight** (Hawar Daun Bakteri)

## 🏗️ Arsitektur

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React UI   │────▶│  Laravel Backend  │────▶│  FastAPI + Model │
│   (Inertia)  │◀────│   (PHP 8.2)       │◀────│  (TensorFlow)    │
└──────────────┘     └───────┬──────────┘     └──────────────────┘
                             │
                     ┌───────▼──────────┐
                     │    MySQL DB       │
                     │  (predictions)    │
                     └──────────────────┘
```

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- Python >= 3.10
- MySQL (XAMPP)

## 🚀 Setup & Instalasi

### 1. Clone & Install Dependensi Laravel

```bash
composer install
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` sesuai konfigurasi MySQL Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=riceguard_ai
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Setup Database

```bash
# Buat database di MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS riceguard_ai"

# Jalankan migrasi
php artisan migrate

# Buat storage link
php artisan storage:link
```

### 4. Setup AI Service (Python)

```bash
cd ai-service

# Buat virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependensi
pip install -r requirements.txt
```

### 5. Training Model (Opsional jika sudah ada model)

```bash
# Download dataset dari Kaggle:
# https://www.kaggle.com/datasets/dedeikhsandwisaputra/rice-leafs-disease-dataset
# Taruh di ai-service/dataset/

cd ai-service
python train.py
```

### 6. Menjalankan Semua Service

**Terminal 1 — FastAPI AI Service:**
```bash
cd ai-service
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Laravel + Vite:**
```bash
# Di root proyek
php artisan serve --port=8080 & npm run dev
```

Buka browser: [http://localhost:8080](http://localhost:8080)

## 📁 Struktur Proyek

```
RiceGuardAI/
├── app/
│   ├── Http/Controllers/
│   │   └── PredictionController.php    # Controller utama
│   ├── Models/
│   │   └── Prediction.php              # Model Eloquent
│   ├── Services/
│   │   └── AiPredictionService.php     # Service komunikasi AI
│   └── Http/Middleware/
│       └── HandleInertiaRequests.php    # Middleware Inertia
├── resources/
│   ├── js/
│   │   ├── app.jsx                     # Entry point React
│   │   ├── Pages/
│   │   │   └── Dashboard.jsx           # Halaman dashboard
│   │   ├── Components/
│   │   │   ├── UploadForm.jsx          # Form upload drag & drop
│   │   │   ├── PredictionResult.jsx    # Tampilan hasil prediksi
│   │   │   └── HistoryTable.jsx        # Tabel riwayat
│   │   └── Layouts/
│   │       └── AppLayout.jsx           # Layout utama
│   └── css/
│       └── app.css                     # Design system
├── ai-service/
│   ├── main.py                         # FastAPI app
│   ├── train.py                        # Script training
│   ├── requirements.txt                # Dependensi Python
│   ├── model/                          # Model terlatih (.h5)
│   └── dataset/                        # Dataset Kaggle
├── database/migrations/                # Migrasi Laravel
├── routes/web.php                      # Routes
└── README.md
```

## 🧪 API Endpoints

### FastAPI (port 8000)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/predict` | Prediksi penyakit dari gambar |

### Laravel (port 8080)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Dashboard utama |
| POST | `/predict` | Upload & prediksi |

## 📄 Lisensi

MIT License
