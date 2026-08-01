"""
RiceGuardAI — FastAPI AI Prediction Service
=============================================
Menyediakan endpoint untuk klasifikasi penyakit tanaman padi
menggunakan model MobileNetV2 yang sudah dilatih.

Jalankan dengan:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ============================================================
# Konfigurasi
# ============================================================
MODEL_PATH = os.getenv("MODEL_PATH", str(Path(__file__).parent / "model" / "rice_disease_model.h5"))
IMG_SIZE = (224, 224)
CLASS_NAMES = ["Bacterial Leaf Blight", "Brown Spot", "Leaf Smut"]

# ============================================================
# Inisialisasi FastAPI
# ============================================================
app = FastAPI(
    title="RiceGuardAI — AI Service",
    description="API untuk klasifikasi penyakit tanaman padi dari gambar daun.",
    version="1.0.0",
)

# CORS — izinkan Laravel mengakses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Load Model (lazy loading)
# ============================================================
_model = None


def get_model():
    """Load model hanya sekali saat pertama kali dibutuhkan."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(
                status_code=503,
                detail=f"Model tidak ditemukan di {MODEL_PATH}. Jalankan train.py terlebih dahulu."
            )
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model berhasil dimuat dari {MODEL_PATH}")
    return _model


# ============================================================
# Preprocessing Gambar
# ============================================================
def preprocess_image(image_bytes: bytes):
    """
    Preprocess gambar untuk model MobileNetV2:
    - Resize ke 224x224
    - Konversi ke RGB
    - Normalisasi pixel ke [0, 1]
    - Tambahkan dimensi batch
    """
    try:
        import numpy as np
        from PIL import Image
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image = image.resize(IMG_SIZE, Image.Resampling.LANCZOS)
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Gagal memproses gambar: {str(e)}"
        )


# ============================================================
# Endpoints
# ============================================================
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    model_exists = os.path.exists(MODEL_PATH)
    return {
        "status": "healthy",
        "model_loaded": _model is not None,
        "model_exists": model_exists,
        "model_path": MODEL_PATH,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Prediksi penyakit tanaman padi dari gambar daun.

    - Menerima file gambar (JPG, PNG, WebP)
    - Mengembalikan kelas penyakit dan confidence score
    """
    # Validasi tipe file
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar (JPG, PNG, WebP)."
        )

    try:
        # Pastikan model ada sebelum memproses gambar.
        # Jika belum ada, sistem akan otomatis melempar error 503 (Model tidak ditemukan).
        model = get_model()

        # Baca file
        image_bytes = await file.read()

        # Preprocess
        img_array = preprocess_image(image_bytes)

        # Prediksi
        import numpy as np
        predictions = model.predict(img_array, verbose=0)
        predicted_index = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_index])
        predicted_class = CLASS_NAMES[predicted_index]

        return JSONResponse(content={
            "class": predicted_class,
            "confidence": round(confidence, 4),
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat prediksi: {str(e)}"
        )


# ============================================================
# Main
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
