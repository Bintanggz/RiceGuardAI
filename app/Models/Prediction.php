<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    /**
     * Kolom yang boleh diisi secara mass-assignment.
     */
    protected $fillable = [
        'image_path',
        'result',
        'confidence',
    ];

    /**
     * Cast tipe data kolom.
     */
    protected $casts = [
        'confidence' => 'float',
    ];
}
