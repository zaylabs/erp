<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_code',
        'name',
        'date_of_birth',
        'phone',
        'address',
        'emergency_phone',
        'cnic',
        'role',
        'qr_payload',
        'onboarding_status',
        'onboarding_submitted_at',
        'documents_received_at',
        'lock_at',
        'grace_approved_at',
        'grace_until',
        'is_locked',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'onboarding_submitted_at' => 'datetime',
        'documents_received_at' => 'datetime',
        'lock_at' => 'date',
        'grace_approved_at' => 'datetime',
        'grace_until' => 'date',
        'is_locked' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function employmentDetails(): HasMany
    {
        return $this->hasMany(EmploymentDetail::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    public function kpis(): HasMany
    {
        return $this->hasMany(Kpi::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }
}
