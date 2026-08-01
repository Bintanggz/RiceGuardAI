import React from 'react';

export default function StatsCards({ stats }) {
    const total = stats?.total ?? 0;
    const mostCommon = stats?.most_common ?? '-';
    const avgConfidence = stats?.avg_confidence ?? 0;

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon stat-icon-blue">📊</div>
                <div className="stat-content">
                    <div className="stat-label">Total Analisis</div>
                    <div className="stat-value">{total} <span className="stat-unit">sampel</span></div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon stat-icon-amber">⚠️</div>
                <div className="stat-content">
                    <div className="stat-label">Penyakit Dominan</div>
                    <div className="stat-value stat-value-sm">{mostCommon}</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon stat-icon-green">🎯</div>
                <div className="stat-content">
                    <div className="stat-label">Rata-rata Akurasi AI</div>
                    <div className="stat-value">{avgConfidence}%</div>
                </div>
            </div>
        </div>
    );
}
