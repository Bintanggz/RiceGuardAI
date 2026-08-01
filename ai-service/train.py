"""
RiceGuardAI — Script Training Model
=====================================
Training model klasifikasi penyakit tanaman padi menggunakan
transfer learning dengan MobileNetV2.

Dataset:
- Download dari Kaggle: Rice Leaf Disease Dataset
- Taruh di folder 'dataset/' dengan struktur:
    dataset/
    ├── Bacterial Leaf Blight/
    ├── Brown Spot/
    ├── Healthy/
    └── Leaf Blast/

  ATAU struktur train/val/test:
    dataset/
    ├── train/
    │   ├── Bacterial Leaf Blight/
    │   ├── Brown Spot/
    │   ├── Healthy/
    │   └── Leaf Blast/
    └── val/
        ├── ...

Jalankan dengan:
    python train.py
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from pathlib import Path

# ============================================================
# Konfigurasi
# ============================================================
DATASET_DIR = str(Path(__file__).parent / "dataset")
MODEL_OUTPUT = str(Path(__file__).parent / "model" / "rice_disease_model.h5")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.001
CLASS_NAMES = ["Bacterial Leaf Blight", "Brown Spot", "Leaf Smut"]
NUM_CLASSES = len(CLASS_NAMES)

# ============================================================
# Setup
# ============================================================
print("=" * 60)
print("  RiceGuardAI — Training Model Klasifikasi Penyakit Padi")
print("=" * 60)

# Pastikan TensorFlow tersedia
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import (
        Dense, GlobalAveragePooling2D, Dropout, Input
    )
    from tensorflow.keras.models import Model
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    print(f"✅ TensorFlow versi: {tf.__version__}")
except ImportError:
    print("❌ TensorFlow tidak ditemukan. Install dengan: pip install tensorflow")
    sys.exit(1)


def detect_dataset_structure(base_dir):
    """
    Auto-deteksi struktur dataset:
    - Flat: folder kelas langsung di dalam base_dir
    - Split: ada subfolder train/val/test
    """
    subdirs = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

    if 'train' in subdirs:
        train_dir = os.path.join(base_dir, 'train')
        val_dir = os.path.join(base_dir, 'val') if 'val' in subdirs else \
                  os.path.join(base_dir, 'validation') if 'validation' in subdirs else None
        test_dir = os.path.join(base_dir, 'test') if 'test' in subdirs else None
        return 'split', train_dir, val_dir, test_dir

    # Periksa apakah subfolder adalah folder kelas
    has_images = False
    for subdir in subdirs:
        subdir_path = os.path.join(base_dir, subdir)
        files = os.listdir(subdir_path)
        image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.bmp'))]
        if image_files:
            has_images = True
            break

    if has_images:
        return 'flat', base_dir, None, None

    print(f"❌ Tidak dapat mendeteksi struktur dataset di {base_dir}")
    print(f"   Subfolder yang ditemukan: {subdirs}")
    sys.exit(1)


def create_data_generators(structure_type, train_dir, val_dir):
    """
    Buat data generator dengan augmentasi untuk training dan validation.
    """
    # Augmentasi data untuk training
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2 if val_dir is None else 0.0,
    )

    # Untuk validation, hanya rescale (tanpa augmentasi)
    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2 if val_dir is None else 0.0,
    )

    if val_dir is None:
        # Flat structure: split otomatis 80/20
        print(f"\n📂 Dataset (flat structure, auto-split 80/20):")
        print(f"   Direktori: {train_dir}")

        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            subset='training',
            shuffle=True,
        )

        val_generator = val_datagen.flow_from_directory(
            train_dir,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            subset='validation',
            shuffle=False,
        )
    else:
        # Split structure: gunakan folder terpisah
        print(f"\n📂 Dataset (split structure):")
        print(f"   Training:   {train_dir}")
        print(f"   Validation: {val_dir}")

        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=True,
        )

        val_generator = val_datagen.flow_from_directory(
            val_dir,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False,
        )

    return train_generator, val_generator


def build_model():
    """
    Buat model dengan transfer learning MobileNetV2.
    """
    print("\n🏗️  Membangun model MobileNetV2...")

    # Base model (ImageNet pretrained, frozen)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3),
    )
    base_model.trainable = False

    # Custom classifier head
    inputs = Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(NUM_CLASSES, activation='softmax')(x)

    model = Model(inputs, outputs)

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    print(f"   Total parameter: {model.count_params():,}")
    trainable = sum(tf.keras.backend.count_params(w) for w in model.trainable_weights)
    print(f"   Trainable parameter: {trainable:,}")
    print(f"   Frozen parameter: {model.count_params() - trainable:,}")

    return model


def train_model(model, train_generator, val_generator):
    """
    Training model dengan callbacks.
    """
    print(f"\n🚀 Memulai training ({EPOCHS} epochs)...")

    # Pastikan folder output ada
    os.makedirs(os.path.dirname(MODEL_OUTPUT), exist_ok=True)

    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        ModelCheckpoint(
            MODEL_OUTPUT,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1,
    )

    return history


def plot_results(history):
    """
    Plot grafik akurasi dan loss training.
    """
    plots_dir = str(Path(__file__).parent / "model")
    os.makedirs(plots_dir, exist_ok=True)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Akurasi
    ax1.plot(history.history['accuracy'], label='Training', linewidth=2)
    ax1.plot(history.history['val_accuracy'], label='Validation', linewidth=2)
    ax1.set_title('Akurasi Model', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Akurasi')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Loss
    ax2.plot(history.history['loss'], label='Training', linewidth=2)
    ax2.plot(history.history['val_loss'], label='Validation', linewidth=2)
    ax2.set_title('Loss Model', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plot_path = os.path.join(plots_dir, 'training_results.png')
    plt.savefig(plot_path, dpi=150, bbox_inches='tight')
    print(f"\n📊 Grafik training disimpan di: {plot_path}")
    plt.close()


def evaluate_model(model, val_generator):
    """
    Evaluasi model dan tampilkan classification report.
    """
    print("\n📈 Evaluasi model...")

    try:
        from sklearn.metrics import classification_report, confusion_matrix

        # Prediksi
        val_generator.reset()
        predictions = model.predict(val_generator, verbose=1)
        y_pred = np.argmax(predictions, axis=1)
        y_true = val_generator.classes[:len(y_pred)]

        # Class names dari generator
        class_indices = val_generator.class_indices
        target_names = [k for k, v in sorted(class_indices.items(), key=lambda item: item[1])]

        # Classification Report
        print("\n" + "=" * 60)
        print("  CLASSIFICATION REPORT")
        print("=" * 60)
        print(classification_report(y_true, y_pred, target_names=target_names))

    except ImportError:
        print("⚠️ scikit-learn tidak tersedia. Lewati classification report.")

    # Evaluasi standar
    loss, accuracy = model.evaluate(val_generator, verbose=0)
    print(f"\n✅ Hasil Akhir:")
    print(f"   Validation Loss:     {loss:.4f}")
    print(f"   Validation Accuracy: {accuracy:.4f} ({accuracy * 100:.1f}%)")


# ============================================================
# Main
# ============================================================
def main():
    # Cek dataset
    if not os.path.exists(DATASET_DIR):
        print(f"\n❌ Dataset tidak ditemukan di: {DATASET_DIR}")
        print(f"   Download dataset dari Kaggle Rice Leaf Disease Dataset")
        print(f"   dan taruh di folder 'dataset/'")
        sys.exit(1)

    # Deteksi struktur
    structure_type, train_dir, val_dir, test_dir = detect_dataset_structure(DATASET_DIR)

    # Buat data generators
    train_gen, val_gen = create_data_generators(structure_type, train_dir, val_dir)

    # Tampilkan info kelas
    print(f"\n📋 Kelas yang terdeteksi: {list(train_gen.class_indices.keys())}")
    print(f"   Total gambar training:   {train_gen.samples}")
    print(f"   Total gambar validation: {val_gen.samples}")

    # Bangun model
    model = build_model()

    # Training
    history = train_model(model, train_gen, val_gen)

    # Plot hasil
    plot_results(history)

    # Evaluasi
    evaluate_model(model, val_gen)

    print(f"\n✅ Model disimpan di: {MODEL_OUTPUT}")
    print("=" * 60)
    print("  Training selesai! 🎉")
    print("=" * 60)


if __name__ == "__main__":
    main()
