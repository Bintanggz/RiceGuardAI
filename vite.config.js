import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import os from 'os';

// Fungsi untuk mendeteksi IP WiFi lokal secara otomatis
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let wifiIP = null;
    let anyIP = null;

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Simpan IP pertama aja sebagai cadangan
                if (!anyIP) anyIP = iface.address;
                
                // Tapi kalau nama koneksinya ada unsur Wi-Fi atau Wireless, jadikan prioritas utama!
                const isWifi = name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || name.toLowerCase().includes('wireless');
                if (isWifi) {
                    wifiIP = iface.address;
                }
            }
        }
    }
    return wifiIP || anyIP || '127.0.0.1';
}

const localIP = getLocalIP();

// Cetak ke layar terminal secara otomatis
console.log(`\n\x1b[33m🚀 Akses di Web / Handphone Anda menggunakan: \x1b[1m\x1b[32mhttp://${localIP}:8080\x1b[0m\n`);

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        hmr: {
            host: localIP,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
