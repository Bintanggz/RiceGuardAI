import React from 'react';

export default function HistoryTable({ predictions }) {
    if (!predictions || predictions.length === 0) {
        return (
            <div className="history-section">
                <div className="history-card">
                    <div className="card-header">
                        <span className="card-icon">📊</span>
                        <h2 className="card-title">Riwayat Prediksi</h2>
                    </div>
                    <div className="history-empty">
                        <div className="history-empty-icon">📭</div>
                        <p>Belum ada riwayat prediksi.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Upload gambar daun padi untuk mulai menganalisis.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'var(--color-healthy)';
        if (confidence >= 0.5) return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

    return (
        <div className="history-section">
            <div className="history-card">
                <div className="card-header">
                    <span className="card-icon">📊</span>
                    <h2 className="card-title">Riwayat Prediksi ({predictions.length})</h2>
                </div>
                <div className="history-table-wrap">
                    <table className="history-table" id="history-table">
                        <thead>
                            <tr>
                                <th>Gambar</th>
                                <th>Penyakit</th>
                                <th>Keyakinan</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map((pred) => (
                                <tr key={pred.id}>
                                    <td>
                                        <img
                                            src={pred.image_url}
                                            alt={pred.result}
                                            className="history-thumb"
                                            loading="lazy"
                                        />
                                    </td>
                                    <td>
                                        <span className="history-disease">
                                            {pred.result}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="history-confidence">
                                            <span style={{ color: getConfidenceColor(pred.confidence), fontWeight: 600 }}>
                                                {Math.round(pred.confidence * 100)}%
                                            </span>
                                            <span className="history-confidence-bar">
                                                <span
                                                    className="history-confidence-fill"
                                                    style={{ width: `${Math.round(pred.confidence * 100)}%` }}
                                                ></span>
                                            </span>
                                        </span>
                                    </td>
                                    <td>
                                        <span className="history-date">{pred.created_at}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
