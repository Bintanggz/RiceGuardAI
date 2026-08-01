import React, { useEffect, useState } from 'react';

// Data informasi penyakit
const DISEASE_INFO = {
    'Healthy': {
        label: 'Sehat',
        emoji: '✅',
        isHealthy: true,
        description: 'Tidak ada penyakit terdeteksi. Daun padi terlihat sehat dan dalam kondisi baik.',
        treatment: 'Lanjutkan perawatan dan pemantauan rutin. Pastikan tanaman mendapat air, nutrisi, dan sinar matahari yang cukup.',
    },
    'Leaf Blast': {
        label: 'Blas Daun (Leaf Blast)',
        emoji: '🍂',
        isHealthy: false,
        description: 'Disebabkan oleh jamur Magnaporthe oryzae. Ditandai dengan lesi berbentuk berlian/mata pada daun, berwarna abu-abu di tengah dengan tepi coklat.',
        treatment: 'Aplikasikan fungisida (Tricyclazole atau Isoprothiolane). Hindari pupuk nitrogen berlebihan. Gunakan varietas tahan blast. Atur jarak tanam yang tepat untuk sirkulasi udara.',
    },
    'Brown Spot': {
        label: 'Bercak Coklat (Brown Spot)',
        emoji: '🟤',
        isHealthy: false,
        description: 'Disebabkan oleh jamur Bipolaris oryzae. Ditandai dengan bercak oval berwarna coklat dengan pusat abu-abu pada daun. Sering terjadi pada tanah yang kurang subur.',
        treatment: 'Gunakan varietas tahan. Aplikasikan fungisida Mancozeb atau Edifenphos. Perbaiki kesuburan tanah dengan pemupukan berimbang. Perlakukan benih dengan fungisida sebelum tanam.',
    },
    'Leaf Smut': {
        label: 'Gosong Daun (Leaf Smut)',
        emoji: '⚫',
        isHealthy: false,
        description: 'Penyakit mematikan akibat jamur Entyloma oryzae. Muncul tonjolan hitam/jelaga pada permukaan daun yang mudah sobek sehingga debu sporanya beterbangan dan menular ke tanaman lain.',
        treatment: 'Cabut dan musnahkan tanaman yang diserang. Jangan menggunakan benih dari wilayah terjangkit. Perlakuan benih dengan fungisida (seed treatment) wajib dilakukan.',
    },
    'Bacterial Leaf Blight': {
        label: 'Hawar Daun Bakteri (BLB)',
        emoji: '🦠',
        isHealthy: false,
        description: 'Disebabkan oleh bakteri Xanthomonas oryzae pv. oryzae. Ditandai dengan lesi kuning-hijau berair di sepanjang tepi daun yang kemudian mengering dan berubah keputihan.',
        treatment: 'Gunakan varietas tahan (IRBB lines). Aplikasikan bakterisida berbasis tembaga. Pastikan drainase yang baik. Hindari irigasi berlebihan dan pupuk nitrogen tinggi.',
    },
};

export default function PredictionResult({ prediction }) {
    const [animatedWidth, setAnimatedWidth] = useState(0);

    const info = DISEASE_INFO[prediction.result] || {
        label: prediction.result,
        emoji: '❓',
        isHealthy: false,
        description: 'Informasi tidak tersedia untuk kelas ini.',
        treatment: 'Konsultasikan dengan ahli pertanian setempat.',
    };

    const confidencePercent = Math.round(prediction.confidence * 100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(confidencePercent);
        }, 100);
        return () => clearTimeout(timer);
    }, [confidencePercent]);

    return (
        <div className="result-card" id="prediction-result">
            {/* Header */}
            <div className="result-header">
                <div className={`result-status-icon ${info.isHealthy ? 'healthy' : 'diseased'}`}>
                    {info.emoji}
                </div>
                <div>
                    <div className={`result-disease-name ${info.isHealthy ? 'healthy' : 'diseased'}`}>
                        {info.label}
                    </div>
                    <div className="result-confidence-label">
                        Hasil Klasifikasi AI
                    </div>
                </div>
            </div>

            {/* Confidence Bar */}
            <div className="confidence-bar-container">
                <div className="confidence-bar-label">
                    <span>Tingkat Keyakinan</span>
                    <span className="confidence-bar-value" style={{
                        color: confidencePercent >= 80 ? 'var(--color-healthy)' :
                               confidencePercent >= 50 ? 'var(--color-warning)' :
                               'var(--color-danger)'
                    }}>
                        {confidencePercent}%
                    </span>
                </div>
                <div className="confidence-bar">
                    <div
                        className="confidence-bar-fill"
                        style={{ width: `${animatedWidth}%` }}
                    ></div>
                </div>
            </div>

            {/* Deskripsi */}
            <div className="result-info-section">
                <div className="result-info-title">📋 Deskripsi</div>
                <p className="result-info-text">{info.description}</p>
            </div>

            {/* Penanganan */}
            <div className="result-info-section">
                <div className="result-info-title">💊 Rekomendasi Penanganan</div>
                <p className="result-info-text">{info.treatment}</p>
            </div>
        </div>
    );
}
