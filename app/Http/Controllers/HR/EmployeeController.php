<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmploymentDetail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::latest()->paginate(15)->withQueryString();
        return Inertia::render('hr/employees/index', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Normalize common aliases
        $normalized = [];
        if ($request->filled('dob') && !$request->filled('date_of_birth')) {
            $request->merge(['date_of_birth' => $request->string('dob')->trim()]);
            $normalized[] = 'dob→date_of_birth';
        }
        if ($request->filled('mobile') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('mobile')->trim()]);
            $normalized[] = 'mobile→phone';
        }
        if ($request->filled('cnic_number') && !$request->filled('cnic')) {
            $request->merge(['cnic' => $request->string('cnic_number')->trim()]);
            $normalized[] = 'cnic_number→cnic';
        }
        if (!empty($normalized)) {
            \Log::info('Employee store: normalized fields', [ 'mapped' => $normalized, 'user_id' => optional($request->user())->id ]);
            $request->session()->flash('normalized_notice', 'Normalized fields: '.implode(', ', $normalized));
        }

        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'emergency_phone' => ['nullable', 'string', 'max:50'],
            'cnic' => ['nullable', 'string', 'max:50'],
            'role' => ['nullable', 'string', 'max:100'],
        ]);

        $payload = 'EMP:' . $validated['employee_code'] . '|' . $validated['name'];
        $validated['qr_payload'] = $payload;

        Employee::create($validated);

        return redirect()->route('hr.employees.index')->with('status', 'Employee created');
    }

    public function show(Employee $employee): Response
    {
        $employee->load(['employmentDetails' => function ($q) {
            $q->latest('effective_date');
        }, 'documents']);

        return Inertia::render('hr/employees/show', [
            'employee' => $employee,
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        // Normalize common aliases
        $normalized = [];
        if ($request->filled('dob') && !$request->filled('date_of_birth')) {
            $request->merge(['date_of_birth' => $request->string('dob')->trim()]);
            $normalized[] = 'dob→date_of_birth';
        }
        if ($request->filled('mobile') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('mobile')->trim()]);
            $normalized[] = 'mobile→phone';
        }
        if ($request->filled('cnic_number') && !$request->filled('cnic')) {
            $request->merge(['cnic' => $request->string('cnic_number')->trim()]);
            $normalized[] = 'cnic_number→cnic';
        }
        if (!empty($normalized)) {
            \Log::info('Employee update: normalized fields', [ 'mapped' => $normalized, 'employee_id' => $employee->id, 'user_id' => optional($request->user())->id ]);
            $request->session()->flash('normalized_notice', 'Normalized fields: '.implode(', ', $normalized));
        }

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code,' . $employee->id],
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'emergency_phone' => ['nullable', 'string', 'max:50'],
            'cnic' => ['nullable', 'string', 'max:50'],
            'role' => ['nullable', 'string', 'max:100'],
        ]);

        if (!array_key_exists('user_id', $validated)) {
            $validated['user_id'] = $employee->user_id;
        }

        $payload = 'EMP:' . $validated['employee_code'] . '|' . $validated['name'];
        $validated['qr_payload'] = $payload;

        $employee->update($validated);
        return redirect()->route('hr.employees.show', $employee)->with('status', 'Employee updated');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();
        return redirect()->route('hr.employees.index')->with('status', 'Employee deleted');
    }

    public function addEmploymentDetail(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'job_title' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'reporting_manager_id' => ['nullable', 'exists:employees,id'],
            'employment_status' => ['required', 'in:full-time,part-time,contractor'],
            'position' => ['nullable', 'string', 'max:255'],
            'pay_grade' => ['nullable', 'string', 'max:100'],
            'pay' => ['nullable', 'numeric'],
            'allowances' => ['nullable', 'numeric'],
            'transport' => ['nullable', 'numeric'],
            'other_allowances' => ['nullable', 'numeric'],
            'effective_date' => ['nullable', 'date'],
            'joining_date' => ['nullable', 'date'],
            // PJP and Zone deferred to territories module
        ]);

        $validated['employee_id'] = $employee->id;
        EmploymentDetail::create($validated);

        return redirect()->route('hr.employees.show', $employee)->with('status', 'Employment details added');
    }

    public function submitForReview(Request $request, Employee $employee): RedirectResponse
    {
        $employee->update([
            'onboarding_status' => 'submitted',
            'onboarding_submitted_at' => now(),
            'lock_at' => now()->addDays(30)->toDateString(),
        ]);
        // Email monitoring team (Executives/Managers)
        $recipients = \App\Models\User::whereIn('role', ['Executive','Manager'])->get();
        if ($recipients->isNotEmpty()) {
            \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\EmployeeSubmittedForReview($employee));
        }
        return redirect()->route('hr.employees.show', $employee)->with('status', 'Onboarding submitted for review');
    }

    public function markDocumentsReceived(Request $request, Employee $employee): RedirectResponse
    {
        $employee->update([
            'documents_received_at' => now(),
            'is_locked' => false,
            'onboarding_status' => 'approved',
        ]);
        return redirect()->route('hr.employees.show', $employee)->with('status', 'Documents marked as received');
    }

    public function approveGrace(Request $request, Employee $employee): RedirectResponse
    {
        // allow only reporting manager or exec/manager roles
        $user = $request->user();
        $latest = $employee->employmentDetails()->latest('effective_date')->first();
        $isReportingManager = $latest && $latest->reporting_manager_id && Employee::where('id', $latest->reporting_manager_id)->where('user_id', $user->id)->exists();
        if (!in_array($user->role, ['Executive','Manager']) && !$isReportingManager) {
            abort(403);
        }

        $employee->update([
            'grace_approved_at' => now(),
            'grace_until' => now()->addDays(30)->toDateString(),
            'is_locked' => false,
        ]);
        return redirect()->route('hr.employees.show', $employee)->with('status', 'Grace period approved');
    }

    public function createLogin(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required','email','unique:users,email'],
            'role' => ['nullable','string','max:100'],
        ]);

        if ($employee->user_id) {
            return back()->with('status', 'User already linked');
        }

        $password = str()->password(12);
        $user = \App\Models\User::create([
            'name' => $employee->name,
            'email' => $validated['email'],
            'role' => $validated['role'] ?? ($employee->role ?: 'Employee'),
            'password' => $password,
        ]);

        $employee->update(['user_id' => $user->id]);

        return redirect()->route('hr.employees.show', $employee)->with('status', 'Login created')->with('generated_password', $password);
    }

    public function runLockCheck(): RedirectResponse
    {
        $now = now()->toDateString();
        $required = ['CNIC','Certificate 1','Certificate 2'];
        $employees = Employee::query()
            ->where(function ($q) use ($now) {
                $q->where(function ($q2) use ($now) {
                    $q2->whereNotNull('lock_at')->where('lock_at', '<=', $now);
                })
                ->orWhere(function ($q3) use ($now) {
                    $q3->whereNotNull('grace_until')->where('grace_until', '<=', $now);
                });
            })
            ->where(function ($q) {
                $q->whereNull('documents_received_at')->orWhere('documents_received_at','=','');
            })
            ->get();

        foreach ($employees as $e) {
            if ($e->grace_until && $e->grace_until > $now) {
                continue;
            }
            $hasAll = $e->documents()->whereIn('type', $required)->select('type')->get()->pluck('type')->unique()->count() === count($required);
            if (!$hasAll) {
                $e->update(['is_locked' => true]);
            }
        }

        return back()->with('status', 'Lock check executed');
    }

    public function deleteEmploymentDetail(Employee $employee, EmploymentDetail $employmentDetail): RedirectResponse
    {
        if ($employmentDetail->employee_id !== $employee->id) {
            abort(404);
        }
        $employmentDetail->delete();
        return redirect()->route('hr.employees.show', $employee)->with('status', 'Employment detail deleted');
    }
}
