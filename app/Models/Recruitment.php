<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recruitment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'candidate_name',
        'father_name',
        'cnic',
        'work_experience',
        'address',
        'phone',
        'email',
        'application_date',
        'application_details',
        'resume_path',
        'interviewer_suitable',
        'interviewer_comments',
        'expected_pay',
        'interview_notes',
        'onboarding_checklist',
        'status',
        'hr_approved_at',
        'hr_approved_by',
        'status_changed_by',
        'status_changed_at',
        'new_hire_employee_id',
    ];

    protected $casts = [
        'application_date' => 'date',
        'application_details' => 'array',
        'onboarding_checklist' => 'array',
        'interviewer_suitable' => 'boolean',
        'expected_pay' => 'decimal:2',
        'hr_approved_at' => 'datetime',
        'status_changed_at' => 'datetime',
    ];

    public function statusChanger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'status_changed_by');
    }

    public function transitions(): HasMany
    {
        return $this->hasMany(RecruitmentTransition::class);
    }

    public function newHire(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'new_hire_employee_id');
    }
}
