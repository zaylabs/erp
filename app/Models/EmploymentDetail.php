<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'job_title',
        'department',
        'reporting_manager_id',
        'employment_status',
        'position',
        'pay_grade',
        'pay',
        'allowances',
        'transport',
        'other_allowances',
        'effective_date',
        'joining_date',
        'zone',
        'pjp',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'pay' => 'decimal:2',
        'allowances' => 'decimal:2',
        'transport' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'joining_date' => 'date',
        'pjp' => 'array',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reporting_manager_id');
    }
}
