"""
RiceGuardAI — Gradio App for Hugging Face Spaces
=================================================
Aplikasi AI interaktif untuk klasifikasi penyakit tanaman padi.
"""

import os
from pathlib import Path
import numpy as np

# Lazy load TensorFlow & PIL agar fast startup
def predict_image(image):
    if image is None:
        return "Silakan unggah gambar daun padi."
    
    try:
        import tensorflow as tf
        from PIL import Image
        
        model_path = Path(__file__).parent / "model" / "rice_disease_model.h5"
        if not os.path.exists(model_path):
            return {"Error": "File model rice_disease_model.h5 tidak ditemukan."}

        model = tf.keras.models.load_model(model_path)
        class_names = ["Bacterial Leaf Blight", "Brown Spot", "Leaf Smut"]

        # Preprocess
        img = Image.fromarray(image).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Prediksi
        predictions = model.predict(img_array, verbose=0)
        confidences = {class_names[i]: float(predictions[0][i]) for i in range(len(class_names))}
        return confidences
    except Exception as e:
        return {"Error": str(e)}


# Buat interface Gradio
try:
    import gradio as gr

    demo = gr.Interface(
        fn=predict_image,
        inputs=gr.Image(label="Unggah Gambar Daun Padi"),
        outputs=gr.Label(num_top_classes=3, label="Hasil Prediksi Penyakit"),
        title="🌾 RiceGuardAI — Deteksi Penyakit Padi",
        description="Unggah foto daun padi untuk mendeteksi apakah tanaman padi sehat atau terserang penyakit (Bacterial Leaf Blight, Brown Spot, Leaf Smut).",
        examples=[]
    )

    if __name__ == "__main__":
        demo.launch(server_name="0.0.0.0", server_port=7860)

except ImportError:
    pass
