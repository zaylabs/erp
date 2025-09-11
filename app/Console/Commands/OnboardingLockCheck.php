<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class OnboardingLockCheck extends Command
{
    protected $signature = 'onboarding:lock-check';
    protected $description = 'Auto-lock employees missing required documents after deadlines';

    public function handle(): int
    {
        $requiredTypes = ['CV','CNIC','Certificate'];
        $today = now()->toDateString();

        $employees = Employee::query()
            ->where(function ($q) use ($today) {
                $q->where(function ($q2) use ($today) {
                    $q2->whereNotNull('lock_at')->where('lock_at', '<=', $today);
                })
                ->orWhere(function ($q3) use ($today) {
                    $q3->whereNotNull('grace_until')->where('grace_until', '<=', $today);
                });
            })
            ->where(function ($q) {
                $q->whereNull('documents_received_at')->orWhere('documents_received_at', '=','');
            })
            ->get();

        $locked = 0;
        foreach ($employees as $employee) {
            // If grace is active in future, skip
            if ($employee->grace_until && $employee->grace_until > $today) {
                continue;
            }

            // Check required docs presence (CV, CNIC, Certificate)
            $hasAll = $employee->documents()->whereIn('type', $requiredTypes)
                ->select('type')->get()->pluck('type')->unique()->count() === count($requiredTypes);

            if (!$hasAll) {
                $employee->update(['is_locked' => true]);
                $locked++;
            }
        }

        $this->info("Processed {$employees->count()} employees, locked {$locked}");
        return self::SUCCESS;
    }
}
