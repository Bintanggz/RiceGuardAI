import React from 'react';

export default function AppLayout({ children }) {
    return (
        <div className="app-layout">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="navbar-brand">
                        <span className="navbar-logo">🌾</span>
                        <div>
                            <div className="navbar-title">
                                Rice<span>Guard</span>AI
                            </div>
                            <div className="navbar-subtitle">
                                Deteksi Penyakit Tanaman Padi
                            </div>
                        </div>
                    </a>
                    <div className="navbar-status">
                        <span className="status-dot"></span>
                        AI Model Aktif
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer">
                &copy; {new Date().getFullYear()} RiceGuardAI — Sistem Deteksi Penyakit Tanaman Padi Berbasis AI
            </footer>
        </div>
    );
}
