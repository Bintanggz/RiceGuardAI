<?php

namespace App\Http\Controllers;

use App\Models\Prediction;
use App\Services\AiPredictionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PredictionController extends Controller
{
    protected AiPredictionService $aiService;

    public function __construct(AiPredictionService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Tampilkan dashboard dengan riwayat prediksi dan statistik.
     */
    public function index()
    {
        $allPredictions = Prediction::all();

        $totalPredictions = $allPredictions->count();
        $avgConfidence = $totalPredictions > 0
            ? round($allPredictions->avg('confidence') * 100)
            : 0;

        $mostCommon = $totalPredictions > 0
            ? Prediction::select('result')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('result')
                ->orderByDesc('count')
                ->first()?->result ?? '-'
            : '-';

        $predictions = Prediction::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($prediction) {
                return [
                    'id' => $prediction->id,
                    'image_path' => $prediction->image_path,
                    'image_url' => '/storage/' . $prediction->image_path,
                    'result' => $prediction->result,
                    'confidence' => $prediction->confidence,
                    'created_at' => $prediction->created_at->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('Dashboard', [
            'predictions' => $predictions,
            'stats' => [
                'total' => $totalPredictions,
                'most_common' => $mostCommon,
                'avg_confidence' => $avgConfidence,
            ],
        ]);
    }

    /**
     * Proses upload gambar dan kirim ke AI service.
     */
    public function predict(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240', // Max 10MB
        ]);

        try {
            // Simpan gambar
            $path = $request->file('image')->store('predictions', 'public');

            // Kirim ke AI service
            $result = $this->aiService->predict($request->file('image'));

            // Simpan ke database
            Prediction::create([
                'image_path' => $path,
                'result' => $result['class'],
                'confidence' => $result['confidence'],
            ]);

            return redirect()->route('dashboard')->with('success', 'Prediksi berhasil!');
        } catch (\Exception $e) {
            // Hapus gambar jika ada error
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return redirect()->route('dashboard')->with('error', $e->getMessage());
        }
    }

    /**
     * Hapus riwayat prediksi tertentu.
     */
    public function destroy(Prediction $prediction)
    {
        try {
            // Hapus file gambar dari disk public
            if ($prediction->image_path && Storage::disk('public')->exists($prediction->image_path)) {
                Storage::disk('public')->delete($prediction->image_path);
            }

            $prediction->delete();

            return redirect()->route('dashboard')->with('success', 'Riwayat prediksi berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Gagal menghapus riwayat: ' . $e->getMessage());
        }
    }
}
