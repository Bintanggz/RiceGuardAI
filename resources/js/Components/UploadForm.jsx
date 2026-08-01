import React, { useRef, useState, useCallback } from 'react';

export default function UploadForm({ onSubmit, processing }) {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
            return;
        }

        // Validasi ukuran (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 10MB.');
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleInputChange = (e) => {
        handleFile(e.target.files[0]);
    };

    const removePreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || processing) return;
        onSubmit(file);
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-icon">📤</span>
                <h2 className="card-title">Upload Gambar Daun Padi</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
                    onClick={() => !preview && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                    />

                    {preview ? (
                        <div className="upload-preview">
                            <img src={preview} alt="Preview daun padi" />
                            <button
                                type="button"
                                className="upload-preview-remove"
                                onClick={removePreview}
                                title="Hapus gambar"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="upload-icon">🍃</div>
                            <p className="upload-text">
                                Seret & lepas gambar di sini, atau <strong>klik untuk pilih</strong>
                            </p>
                            <p className="upload-hint">
                                Format: JPG, PNG, WebP • Maks. 10MB
                            </p>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={!file || processing}
                    id="predict-button"
                >
                    {processing ? (
                        <>
                            <span className="spinner"></span>
                            Menganalisis...
                        </>
                    ) : (
                        <>
                            🔬 Analisis Penyakit
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
