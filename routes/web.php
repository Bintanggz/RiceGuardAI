<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PredictionController;

Route::get('/', [PredictionController::class, 'index'])->name('dashboard');
Route::post('/predict', [PredictionController::class, 'predict'])->name('predict');
Route::delete('/predictions/{prediction}', [PredictionController::class, 'destroy'])->name('predictions.destroy');
