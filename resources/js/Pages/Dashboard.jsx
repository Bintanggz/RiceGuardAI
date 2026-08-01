import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import UploadForm from '../Components/UploadForm';
import PredictionResult from '../Components/PredictionResult';
import HistoryTable from '../Components/HistoryTable';
import StatsCards from '../Components/StatsCards';

export default function Dashboard({ predictions, stats }) {
    const { flash } = usePage().props;
    const [processing, setProcessing] = useState(false);

    // Ambil prediksi terbaru untuk ditampilkan sebagai result
    const latestPrediction = predictions && predictions.length > 0 ? predictions[0] : null;
    const [showResult, setShowResult] = useState(!!latestPrediction);

    const handleSubmit = (file) => {
        const formData = new FormData();
        formData.append('image', file);

        setProcessing(true);
        setShowResult(false);

        router.post('/predict', formData, {
            forceFormData: true,
            onFinish: () => {
                setProcessing(false);
                setShowResult(true);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">
                    🤖 Powered by MobileNetV2 + TensorFlow
                </div>
                <h1 className="hero-title">
                    Deteksi Penyakit<br />
                    <span className="highlight">Tanaman Padi</span> dengan AI
                </h1>
                <p className="hero-description">
                    Upload foto daun padi dan sistem AI kami akan mengidentifikasi penyakit
                    secara instan dengan tingkat akurasi tinggi. Mendukung deteksi Leaf Smut,
                    Brown Spot, dan Bacterial Leaf Blight.
                </p>
            </section>

            {/* Stats Summary Cards */}
            <StatsCards stats={stats} />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="flash-message flash-success">
                    ✅ {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="flash-message flash-error">
                    ❌ {flash.error}
                </div>
            )}

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Upload Form */}
                <UploadForm onSubmit={handleSubmit} processing={processing} />

                {/* Result Card */}
                <div>
                    {showResult && latestPrediction ? (
                        <PredictionResult prediction={latestPrediction} />
                    ) : (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔬</div>
                            <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                                Hasil Analisis
                            </h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                Upload gambar daun padi untuk melihat hasil prediksi di sini.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            <HistoryTable predictions={predictions} />
        </AppLayout>
    );
}
