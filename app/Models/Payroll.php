<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period_start',
        'period_end',
        'salary',
        'hourly_wage',
        'tax_information',
        'bank_account_details',
        'benefits',
        'total_compensation',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'salary' => 'decimal:2',
        'hourly_wage' => 'decimal:2',
        'tax_information' => 'array',
        'bank_account_details' => 'array',
        'benefits' => 'array',
        'total_compensation' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

