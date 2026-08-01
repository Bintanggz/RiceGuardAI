<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi - buat tabel predictions.
     */
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->string('image_path');
            $table->string('result');
            $table->float('confidence');
            $table->timestamps();
        });
    }

    /**
     * Balikkan migrasi - hapus tabel predictions.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
