<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class AiPredictionService
{
    /**
     * URL dari FastAPI AI service.
     */
    protected string $serviceUrl;

    public function __construct()
    {
        $this->serviceUrl = config('services.ai.url', env('AI_SERVICE_URL', 'http://localhost:8000'));
    }

    /**
     * Kirim gambar ke FastAPI untuk prediksi.
     *
     * @param UploadedFile $image
     * @return array{class: string, confidence: float}
     * @throws \Exception
     */
    public function predict(UploadedFile $image): array
    {
        try {
            $response = Http::timeout(30)
                ->attach(
                    'file',
                    file_get_contents($image->getPathname()),
                    $image->getClientOriginalName()
                )
                ->post("{$this->serviceUrl}/predict");

            if ($response->failed()) {
                Log::error('AI Service error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI Service gagal memproses gambar. Status: ' . $response->status());
            }

            $data = $response->json();

            if (!isset($data['class']) || !isset($data['confidence'])) {
                throw new \Exception('Response dari AI Service tidak valid.');
            }

            return [
                'class' => $data['class'],
                'confidence' => round((float) $data['confidence'], 4),
            ];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AI Service tidak dapat dihubungi', ['error' => $e->getMessage()]);
            throw new \Exception('AI Service tidak dapat dihubungi. Pastikan FastAPI sudah berjalan di ' . $this->serviceUrl);
        }
    }
}
