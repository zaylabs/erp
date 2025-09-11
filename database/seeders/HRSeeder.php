<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\EmploymentDetail;
use App\Models\EmployeeDocument;
use App\Models\Payroll;
use App\Models\Recruitment;
use App\Models\User;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HRSeeder extends Seeder
{
    /**
     * Seed a sample HR dataset.
     */
    public function run(): void
    {
        $fakerPk = \Faker\Factory::create('en_PK');
        $faker = \Faker\Factory::create();

        $pkMobile = function (): string {
            $prefixes = ['030', '031', '032', '033', '034'];
            $p = $prefixes[array_rand($prefixes)] . str_pad((string)rand(0, 9999997), 7, '0', STR_PAD_LEFT);
            return '+92' . substr($p, 1);
        };

        // Create a default work schedule
        $defaultSchedule = WorkSchedule::query()->first() ?: WorkSchedule::create([
            'name' => 'Standard 9-6',
            'start_time' => '09:00:00',
            'end_time' => '18:00:00',
            'days_of_week' => [1,2,3,4,5],
        ]);

        // Role quotas
        $roles = [
            'Executive' => 2,
            'Manager' => 4,
            'Sales Manager' => 6,
            'Sales Officer' => 10,
        ];

        $employees = collect();

        // 1) Users + Employees
        $employeeCounter = 1;

        // Seed a fixed first user from Pakistan: Adil Raza
        $adilName = 'Adil Raza';
        $adilUser = User::create([
            'name' => $adilName,
            'email' => 'adilraza@zaylabs.com',
            'role' => 'Executive',
            'password' => 'password',
        ]);

        // Onboarding setup for Adil
        $submittedAt = Carbon::now()->subDays(3);
        $adilEmployee = Employee::create([
            'user_id' => $adilUser->id,
            'employee_code' => 'EMP-'.str_pad((string)$employeeCounter, 4, '0', STR_PAD_LEFT),
            'name' => $adilName,
            'date_of_birth' => Carbon::now()->subYears(35)->subDays(20)->toDateString(),
            'phone' => $pkMobile(),
            'address' => $fakerPk->address(),
            'emergency_phone' => $pkMobile(),
            'cnic' => (string) $faker->numerify('#############'),
            'role' => 'Executive',
            'qr_payload' => 'EMP:EMP-'.str_pad((string)$employeeCounter, 4, '0', STR_PAD_LEFT).'|'.$adilName,
            'onboarding_status' => 'submitted',
            'onboarding_submitted_at' => $submittedAt->toDateTimeString(),
            'documents_received_at' => null,
            'lock_at' => (clone $submittedAt)->addDays(30)->toDateString(),
            'grace_approved_at' => null,
            'grace_until' => null,
            'is_locked' => false,
        ]);
        $employees->push($adilEmployee);
        $employeeCounter++;

        // Reduce one Executive from the quotas since Adil is seeded
        if (isset($roles['Executive']) && $roles['Executive'] > 0) {
            $roles['Executive'] = max(0, $roles['Executive'] - 1);
        }

        foreach ($roles as $role => $count) {
            for ($i = 0; $i < $count; $i++) {
                $name = $fakerPk->name();
                $user = User::create([
                    'name' => $name,
                    'email' => Str::slug($name) . '+' . Str::random(6) . '@example.com',
                    'role' => $role,
                    'password' => 'password',
                ]);

                // Onboarding setup buckets
                $bucket = ($employeeCounter % 4);
                $submittedAt = Carbon::now()->subDays(10);
                $lockAt = (clone $submittedAt)->addDays(30)->toDateString();
                $graceApprovedAt = null; $graceUntil = null; $docsReceivedAt = null; $isLocked = false; $status = 'submitted';
                if ($bucket === 0) { // approved
                    $status = 'approved';
                    $docsReceivedAt = Carbon::now()->subDays(2)->toDateTimeString();
                } elseif ($bucket === 1) { // submitted, not yet due
                    $submittedAt = Carbon::now()->subDays(5);
                    $lockAt = Carbon::now()->addDays(25)->toDateString();
                } elseif ($bucket === 2) { // grace ongoing
                    $submittedAt = Carbon::now()->subDays(35);
                    $lockAt = Carbon::now()->subDays(5)->toDateString();
                    $graceApprovedAt = Carbon::now()->subDays(4)->toDateTimeString();
                    $graceUntil = Carbon::now()->addDays(26)->toDateString();
                } else { // locked
                    $submittedAt = Carbon::now()->subDays(40);
                    $lockAt = Carbon::now()->subDays(10)->toDateString();
                    $graceApprovedAt = Carbon::now()->subDays(9)->toDateTimeString();
                    $graceUntil = Carbon::now()->subDays(1)->toDateString();
                    $isLocked = true;
                }

                $employee = Employee::create([
                    'user_id' => $user->id,
                    'employee_code' => 'EMP-'.str_pad((string)$employeeCounter, 4, '0', STR_PAD_LEFT),
                    'name' => $name,
                    'date_of_birth' => Carbon::now()->subYears(rand(22, 50))->subDays(rand(0, 365))->toDateString(),
                    'phone' => $pkMobile(),
                    'address' => $fakerPk->address(),
                    'emergency_phone' => $pkMobile(),
                    'cnic' => (string) $faker->numerify('#############'),
                    'role' => $role,
                    'qr_payload' => 'EMP:EMP-'.str_pad((string)$employeeCounter, 4, '0', STR_PAD_LEFT).'|'.$name,
                    'onboarding_status' => $status,
                    'onboarding_submitted_at' => $submittedAt->toDateTimeString(),
                    'documents_received_at' => $docsReceivedAt,
                    'lock_at' => $lockAt,
                    'grace_approved_at' => $graceApprovedAt,
                    'grace_until' => $graceUntil,
                    'is_locked' => $isLocked,
                ]);

                $employees->push($employee);
                $employeeCounter++;
            }
        }

        // Managers pool (exclude Sales Officer from being a reporting manager)
        $managerPool = $employees->filter(fn ($e) => in_array($e->role, ['Executive', 'Manager', 'Sales Manager']))->values();

        // 2) Employment details (latest effective date per employee)
        $departments = ['Sales', 'Operations', 'HR', 'Finance', 'Support'];
        foreach ($employees as $emp) {
            $manager = $managerPool->isNotEmpty()
                ? $managerPool->random()
                : null;
            if ($manager && $manager->id === $emp->id && $managerPool->count() > 1) {
                // Avoid self as manager
                $manager = $managerPool->where('id', '!=', $emp->id)->random();
            }

            EmploymentDetail::create([
                'employee_id' => $emp->id,
                'job_title' => $emp->role,
                'department' => Arr::random($departments),
                'reporting_manager_id' => $manager?->id,
                'employment_status' => Arr::random(['full-time','part-time','contractor']),
                'position' => $emp->role,
                'pay_grade' => Arr::random(['A1','A2','B1','B2','C1']),
                'pay' => rand(40_000, 300_000),
                'allowances' => rand(2_000, 50_000),
                'transport' => rand(0, 10_000),
                'other_allowances' => rand(0, 10_000),
                'effective_date' => Carbon::now()->subMonths(rand(0, 24))->toDateString(),
                'joining_date' => Carbon::now()->subMonths(rand(1, 12))->toDateString(),
                // zone and pjp deferred in this phase
            ]);

            // Seed required documents (omit one if locked to simulate missing)
            $docTypes = ['CV','CNIC','Certificate'];
            foreach ($docTypes as $docType) {
                if ($emp->is_locked && $docType === Arr::random($docTypes)) {
                    continue;
                }
                $fileName = $emp->employee_code.'-'.Str::slug($docType).'-'.Str::random(5).'.pdf';
                $path = 'employee-docs/'.$fileName;
                Storage::disk('public')->put($path, "%PDF-1.4\n% Dummy PDF for seeding\n");
                EmployeeDocument::create([
                    'employee_id' => $emp->id,
                    'type' => $docType,
                    'file_path' => $path,
                    'uploaded_by' => $emp->user_id,
                ]);
            }
        }

        // 3) Attendance (a few recent days per employee)
        foreach ($employees as $emp) {
            $days = 3; // keep it light
            for ($d = 0; $d < $days; $d++) {
                $date = Carbon::now()->subDays($d + rand(0, 3))->toDateString();
                AttendanceRecord::create([
                    'employee_id' => $emp->id,
                    'work_date' => $date,
                    'clock_in' => '09:'.str_pad((string)rand(0, 20), 2, '0', STR_PAD_LEFT).':00',
                    'clock_out' => '18:'.str_pad((string)rand(0, 20), 2, '0', STR_PAD_LEFT).':00',
                    'work_schedule_id' => $defaultSchedule->id,
                    'status' => Arr::random(['present','present','present','on_leave']),
                    'leave_type' => null,
                    'approved_by' => null,
                ]);
            }
        }

        // 4) Payrolls (one period per employee)
        foreach ($employees as $emp) {
            $periodStart = Carbon::now()->subMonth()->startOfMonth()->toDateString();
            $periodEnd = Carbon::now()->subMonth()->endOfMonth()->toDateString();
            $salary = rand(60_000, 250_000);
            Payroll::create([
                'employee_id' => $emp->id,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'salary' => $salary,
                'hourly_wage' => null,
                'tax_information' => [
                    'ntn' => strtoupper(Str::random(8)),
                ],
                'bank_account_details' => [
                    'bank' => 'Sample Bank',
                    'iban' => 'PK'.rand(10,99).Str::upper(Str::random(20)),
                ],
                'benefits' => [
                    'health' => true,
                    'pf' => true,
                ],
                'total_compensation' => $salary + rand(0, 20_000),
            ]);
        }

        // KPIs deferred in this phase

        // Recruitment (sample candidates with onboarding fields)
        for ($i = 0; $i < 6; $i++) {
            $candName = $fakerPk->name();
            $resumeFile = 'recruitment-cv/'.Str::slug($candName).'-'.Str::random(5).'.pdf';
            Storage::disk('public')->put($resumeFile, "%PDF-1.4\n% Dummy CV PDF\n");
            $suitable = (bool) rand(0,1);
            $approvedAt = $suitable && rand(0,1) ? Carbon::now()->subDays(rand(0,5))->toDateTimeString() : null;
            Recruitment::create([
                'candidate_name' => $candName,
                'father_name' => $fakerPk->name(),
                'cnic' => (string) $faker->numerify('#############'),
                'work_experience' => $faker->sentence(8),
                'address' => $fakerPk->address(),
                'phone' => $pkMobile(),
                'email' => Str::slug($candName).'+'.Str::random(4).'@example.com',
                'application_date' => Carbon::now()->subDays(rand(1, 30))->toDateString(),
                'application_details' => [ 'source' => Arr::random(['LinkedIn','Referral','Website']) ],
                'resume_path' => $resumeFile,
                'interviewer_suitable' => $suitable,
                'interviewer_comments' => $suitable ? 'Looks promising.' : 'Not a fit currently.',
                'expected_pay' => rand(50_000, 250_000),
                'interview_notes' => 'Auto-generated notes.',
                'onboarding_checklist' => ['NDA','ID Proof','Address Proof'],
                'status' => Arr::random(['applied','interview','offer','hired','rejected']),
                'hr_approved_at' => $approvedAt,
                'hr_approved_by' => null,
                'new_hire_employee_id' => null,
            ]);
        }
    }
}
