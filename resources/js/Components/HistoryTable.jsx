import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import PredictionResult from './PredictionResult';

export default function HistoryTable({ predictions }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDisease, setFilterDisease] = useState('ALL');
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // List unik opsi penyakit untuk filter
    const diseaseOptions = useMemo(() => {
        if (!predictions) return [];
        const unique = Array.from(new Set(predictions.map((p) => p.result)));
        return unique;
    }, [predictions]);

    // Data terfilter berdasarkan search & filter
    const filteredPredictions = useMemo(() => {
        if (!predictions) return [];
        return predictions.filter((pred) => {
            const matchesSearch =
                pred.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pred.created_at.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                filterDisease === 'ALL' || pred.result === filterDisease;

            return matchesSearch && matchesFilter;
        });
    }, [predictions, searchQuery, filterDisease]);

    const handleDelete = (id, resultName) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data prediksi "${resultName}"?`)) {
            setDeletingId(id);
            router.delete(`/predictions/${id}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'var(--color-healthy)';
        if (confidence >= 0.5) return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

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

    return (
        <div className="history-section">
            <div className="history-card">
                <div className="history-card-top">
                    <div className="card-header" style={{ marginBottom: 0 }}>
                        <span className="card-icon">📊</span>
                        <h2 className="card-title">
                            Riwayat Prediksi ({filteredPredictions.length}/{predictions.length})
                        </h2>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="history-controls">
                        <div className="history-search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="history-search-input"
                                placeholder="Cari penyakit / tanggal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="search-clear-btn"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <select
                            className="history-filter-select"
                            value={filterDisease}
                            onChange={(e) => setFilterDisease(e.target.value)}
                        >
                            <option value="ALL">Semua Penyakit</option>
                            {diseaseOptions.map((disease) => (
                                <option key={disease} value={disease}>
                                    {disease}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="history-table-wrap">
                    {filteredPredictions.length === 0 ? (
                        <div className="history-empty" style={{ padding: '2rem' }}>
                            <div className="history-empty-icon">🔍</div>
                            <p>Tidak ada data riwayat yang cocok dengan pencarian/filter.</p>
                        </div>
                    ) : (
                        <table className="history-table" id="history-table">
                            <thead>
                                <tr>
                                    <th>Gambar</th>
                                    <th>Penyakit</th>
                                    <th>Keyakinan</th>
                                    <th>Tanggal</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPredictions.map((pred) => (
                                    <tr key={pred.id}>
                                        <td>
                                            <img
                                                src={pred.image_url}
                                                alt={pred.result}
                                                className="history-thumb"
                                                loading="lazy"
                                                onClick={() => setSelectedPrediction(pred)}
                                                style={{ cursor: 'pointer' }}
                                                title="Klik untuk lihat detail"
                                            />
                                        </td>
                                        <td>
                                            <span className="history-disease">
                                                {pred.result}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="history-confidence">
                                                <span
                                                    style={{
                                                        color: getConfidenceColor(pred.confidence),
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {Math.round(pred.confidence * 100)}%
                                                </span>
                                                <span className="history-confidence-bar">
                                                    <span
                                                        className="history-confidence-fill"
                                                        style={{
                                                            width: `${Math.round(pred.confidence * 100)}%`,
                                                        }}
                                                    ></span>
                                                </span>
                                            </span>
                                        </td>
                                        <td>
                                            <span className="history-date">{pred.created_at}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="history-actions">
                                                <button
                                                    className="btn-action btn-action-view"
                                                    onClick={() => setSelectedPrediction(pred)}
                                                    title="Lihat Detail"
                                                >
                                                    👁️ Detail
                                                </button>
                                                <button
                                                    className="btn-action btn-action-delete"
                                                    onClick={() => handleDelete(pred.id, pred.result)}
                                                    disabled={deletingId === pred.id}
                                                    title="Hapus Riwayat"
                                                >
                                                    {deletingId === pred.id ? '...' : '🗑️ Hapus'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Detail Prediction */}
            {selectedPrediction && (
                <div
                    className="modal-backdrop"
                    onClick={() => setSelectedPrediction(null)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>📋 Detail Analisis Prediksi</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedPrediction(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-image-preview">
                                <img
                                    src={selectedPrediction.image_url}
                                    alt={selectedPrediction.result}
                                />
                                <div className="modal-image-date">
                                    🗓️ Waktu: {selectedPrediction.created_at}
                                </div>
                            </div>
                            <PredictionResult prediction={selectedPrediction} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
