<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kpi extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period',
        'goals',
        'performance_rating',
        'review_notes',
        'trainings',
        'skills',
    ];

    protected $casts = [
        'goals' => 'array',
        'performance_rating' => 'decimal:2',
        'trainings' => 'array',
        'skills' => 'array',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

