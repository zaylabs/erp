<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentTransition extends Model
{
    use HasFactory;

    protected $fillable = [
        'recruitment_id', 'from_status', 'to_status', 'changed_by', 'changed_at', 'notes',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function recruitment(): BelongsTo
    {
        return $this->belongsTo(Recruitment::class);
    }

    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

