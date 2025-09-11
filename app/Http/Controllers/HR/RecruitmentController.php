<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Recruitment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    public function index(Request $request): Response
    {
        $stage = $request->query('stage');
        $with = ['statusChanger', 'transitions.changedByUser'];
        $query = Recruitment::query()->with($with);
        if (in_array($stage, ['interview','candidate','approved'])) {
            $query->where('status', $stage);
        } elseif ($stage === 'trashed') {
            $query = Recruitment::onlyTrashed()->with($with);
        }
        $recs = $query->latest()->paginate(15)->withQueryString();

        // Counts for tabs
        $counts = [
            'interview' => Recruitment::where('status','interview')->count(),
            'candidate' => Recruitment::where('status','candidate')->count(),
            'approved' => Recruitment::where('status','approved')->count(),
            'trashed' => Recruitment::onlyTrashed()->count(),
        ];

        return Inertia::render('hr/recruitment/index', [
            'recruitments' => $recs,
            'stage' => $stage,
            'counts' => $counts,
        ]);
    }

    public function show(Recruitment $recruitment): Response
    {
        return Inertia::render('hr/recruitment/show', [
            'recruitment' => $recruitment,
            'transitions' => $recruitment->transitions()->with('changedByUser')->orderBy('changed_at','asc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Normalize common aliases
        $normalized = [];
        if ($request->filled('name') && !$request->filled('candidate_name')) {
            $request->merge(['candidate_name' => $request->string('name')->trim()]);
            $normalized[] = 'name→candidate_name';
        }
        if ($request->hasFile('resume') && !$request->hasFile('cv')) {
            $request->files->set('cv', $request->file('resume'));
            $normalized[] = 'resume→cv';
        }
        if ($request->filled('phone_number') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('phone_number')->trim()]);
            $normalized[] = 'phone_number→phone';
        }
        if ($request->filled('mobile') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('mobile')->trim()]);
            $normalized[] = 'mobile→phone';
        }
        if ($request->filled('email_address') && !$request->filled('email')) {
            $request->merge(['email' => $request->string('email_address')->trim()]);
            $normalized[] = 'email_address→email';
        }
        if ($request->filled('cnic_number') && !$request->filled('cnic')) {
            $request->merge(['cnic' => $request->string('cnic_number')->trim()]);
            $normalized[] = 'cnic_number→cnic';
        }
        if ($request->filled('father') && !$request->filled('father_name')) {
            $request->merge(['father_name' => $request->string('father')->trim()]);
            $normalized[] = 'father→father_name';
        }
        if (!empty($normalized)) {
            Log::info('Recruitment store: normalized fields', [
                'user_id' => optional($request->user())->id,
                'mapped' => $normalized,
            ]);
            $request->session()->flash('normalized_notice', 'Normalized fields: '.implode(', ', $normalized));
        }

        // Coerce interviewer_suitable 'yes'/'no' to boolean before validation
        if ($request->has('interviewer_suitable')) {
            $val = $request->input('interviewer_suitable');
            if (in_array($val, ['yes', 'true', 1, '1', true], true)) {
                $request->merge(['interviewer_suitable' => true]);
            } elseif (in_array($val, ['no', 'false', 0, '0', false], true)) {
                $request->merge(['interviewer_suitable' => false]);
            }
        }

        $rules = [
            'candidate_name' => ['required', 'string', 'max:255'],
            'father_name' => ['required', 'string', 'max:255'],
            'cnic' => ['required', 'string', 'max:25'],
            'work_experience' => ['nullable', 'string'],
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'application_date' => ['nullable', 'date'],
            'application_details' => ['nullable', 'array'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:8192'],
            'interview_notes' => ['nullable', 'string'],
            // Interview section
            'interviewer_suitable' => ['nullable', 'boolean'],
            'interviewer_comments' => ['nullable', 'string'],
            'expected_pay' => ['nullable', 'numeric'],
            'onboarding_checklist' => ['nullable', 'array'],
            'status' => ['sometimes', 'in:applied,interview,offer,hired,rejected'],
        ];
        $messages = [
            'candidate_name.required' => "Please enter the candidate's name.",
            'father_name.required' => "Father's name is required.",
            'cnic.required' => 'CNIC is required.',
            'email.email' => 'Enter a valid email address.',
            'cv.mimes' => 'CV must be a PDF file.',
            'status.in' => 'Status must be one of: applied, interview, offer, hired, rejected.',
        ];
        $validated = $request->validate($rules, $messages);

        $data = $validated;
        // Always start in interview state (Interview Candidates list)
        $data['status'] = 'interview';
        $data['status_changed_by'] = optional($request->user())->id;
        $data['status_changed_at'] = now();
        if ($request->hasFile('cv')) {
            $data['resume_path'] = $request->file('cv')->store('recruitment-cv', 'public');
        }
        unset($data['cv']);
        $rec = Recruitment::create($data);
        // Log transition
        \App\Models\RecruitmentTransition::create([
            'recruitment_id' => $rec->id,
            'from_status' => null,
            'to_status' => 'interview',
            'changed_by' => optional($request->user())->id,
            'changed_at' => now(),
            'notes' => 'Onboarding submitted',
        ]);
        return redirect()->route('hr.recruitment.index', ['stage' => 'interview', 'edit' => $rec->id])
            ->with('status', 'Recruitment saved');
    }

    public function update(Request $request, Recruitment $recruitment): RedirectResponse
    {
        // Normalize common aliases
        $normalized = [];
        if ($request->filled('name') && !$request->filled('candidate_name')) {
            $request->merge(['candidate_name' => $request->string('name')->trim()]);
            $normalized[] = 'name→candidate_name';
        }
        if ($request->hasFile('resume') && !$request->hasFile('cv')) {
            $request->files->set('cv', $request->file('resume'));
            $normalized[] = 'resume→cv';
        }
        if ($request->filled('phone_number') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('phone_number')->trim()]);
            $normalized[] = 'phone_number→phone';
        }
        if ($request->filled('mobile') && !$request->filled('phone')) {
            $request->merge(['phone' => $request->string('mobile')->trim()]);
            $normalized[] = 'mobile→phone';
        }
        if ($request->filled('email_address') && !$request->filled('email')) {
            $request->merge(['email' => $request->string('email_address')->trim()]);
            $normalized[] = 'email_address→email';
        }
        if ($request->filled('cnic_number') && !$request->filled('cnic')) {
            $request->merge(['cnic' => $request->string('cnic_number')->trim()]);
            $normalized[] = 'cnic_number→cnic';
        }
        if ($request->filled('father') && !$request->filled('father_name')) {
            $request->merge(['father_name' => $request->string('father')->trim()]);
            $normalized[] = 'father→father_name';
        }
        if (!empty($normalized)) {
            Log::info('Recruitment update: normalized fields', [
                'user_id' => optional($request->user())->id,
                'recruitment_id' => $recruitment->id,
                'mapped' => $normalized,
            ]);
            $request->session()->flash('normalized_notice', 'Normalized fields: '.implode(', ', $normalized));
        }

        $rules = [
            'candidate_name' => ['sometimes', 'string', 'max:255'],
            'father_name' => ['sometimes', 'string', 'max:255'],
            'cnic' => ['sometimes', 'string', 'max:25'],
            'work_experience' => ['nullable', 'string'],
            'address' => ['sometimes', 'string', 'max:500'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'email' => ['sometimes', 'email', 'max:255'],
            'application_date' => ['nullable', 'date'],
            'application_details' => ['nullable', 'array'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:8192'],
            // Interview section
            'interviewer_suitable' => ['nullable', 'boolean'],
            'interviewer_comments' => ['nullable', 'string'],
            'expected_pay' => ['nullable', 'numeric'],
            'interview_notes' => ['nullable', 'string'],
            'onboarding_checklist' => ['nullable', 'array'],
            'status' => ['sometimes', 'in:applied,interview,offer,hired,rejected'],
            'new_hire_employee_id' => ['sometimes', 'nullable', 'exists:employees,id'],
        ];
        $messages = [
            'candidate_name.string' => "Candidate name must be text.",
            'email.email' => 'Enter a valid email address.',
            'cv.mimes' => 'CV must be a PDF file.',
            'status.in' => 'Status must be one of: applied, interview, offer, hired, rejected.',
        ];
        $validated = $request->validate($rules, $messages);

        if (!array_key_exists('new_hire_employee_id', $validated)) {
            $validated['new_hire_employee_id'] = $recruitment->new_hire_employee_id;
        }

        $data = $validated;
        if ($request->hasFile('cv')) {
            $data['resume_path'] = $request->file('cv')->store('recruitment-cv', 'public');
        }
        unset($data['cv']);

        // If interviewer decision provided, transition status
        if (array_key_exists('interviewer_suitable', $data)) {
            $suitable = $data['interviewer_suitable'];
            if (!is_bool($suitable)) {
                $suitable = in_array($suitable, ['1', 1, true, 'true', 'yes'], true);
            }
            $data['interviewer_suitable'] = $suitable;
            $to = $suitable ? 'candidate' : 'rejected';
            $data['status'] = $to;
            $data['status_changed_by'] = optional($request->user())->id;
            $data['status_changed_at'] = now();
            \App\Models\RecruitmentTransition::create([
                'recruitment_id' => $recruitment->id,
                'from_status' => $recruitment->status,
                'to_status' => $to,
                'changed_by' => optional($request->user())->id,
                'changed_at' => now(),
                'notes' => $suitable ? 'Qualified by interviewer' : 'Rejected by interviewer',
            ]);
        }

        $recruitment->update($data);
        return redirect()->route('hr.recruitment.index', [
            'stage' => $recruitment->status ?? 'interview',
            'edit' => $recruitment->id,
        ])->with('status', 'Recruitment updated');
    }

    public function approve(Request $request, Recruitment $recruitment): RedirectResponse
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Admin','Executive','Manager'])) {
            abort(403);
        }
        $recruitment->update([
            'hr_approved_at' => now(),
            'hr_approved_by' => $user->id,
            'status' => 'approved',
            'status_changed_by' => $user->id,
            'status_changed_at' => now(),
        ]);
        \App\Models\RecruitmentTransition::create([
            'recruitment_id' => $recruitment->id,
            'from_status' => $recruitment->status,
            'to_status' => 'approved',
            'changed_by' => $user->id,
            'changed_at' => now(),
            'notes' => 'Approved by HR',
        ]);
        return redirect()->route('hr.recruitment.index', [
            'stage' => 'approved',
            'edit' => $recruitment->id,
        ])->with('status', 'Recruitment approved by HR');
    }

    public function convertToEmployee(Request $request, Recruitment $recruitment): RedirectResponse
    {
        if (!$recruitment->hr_approved_at || !$recruitment->interviewer_suitable) {
            return back()->with('status', 'Recruitment not approved/suitable');
        }
        if ($recruitment->new_hire_employee_id) {
            return back()->with('status', 'Already converted');
        }

        $password = str()->password(12);
        $user = \App\Models\User::firstOrCreate(
            ['email' => $recruitment->email],
            ['name' => $recruitment->candidate_name, 'role' => 'Employee', 'password' => $password]
        );

        // Create employee
        $code = 'EMP-'.str_pad((string)(\App\Models\Employee::max('id') + 1), 4, '0', STR_PAD_LEFT);
        $employee = \App\Models\Employee::create([
            'user_id' => $user->id,
            'employee_code' => $code,
            'name' => $recruitment->candidate_name,
            'address' => $recruitment->address,
            'phone' => $recruitment->phone,
            'cnic' => $recruitment->cnic,
            'role' => 'Employee',
            'qr_payload' => 'EMP:'.$code.'|'.$recruitment->candidate_name,
            'onboarding_status' => 'submitted',
            'onboarding_submitted_at' => now(),
            'lock_at' => now()->addDays(30)->toDateString(),
            'is_locked' => false,
        ]);

        if ($recruitment->resume_path) {
            \App\Models\EmployeeDocument::create([
                'employee_id' => $employee->id,
                'type' => 'CV',
                'file_path' => $recruitment->resume_path,
                'uploaded_by' => $user->id,
            ]);
        }

        // Log transition to converted/employee then soft-delete
        \App\Models\RecruitmentTransition::create([
            'recruitment_id' => $recruitment->id,
            'from_status' => $recruitment->status,
            'to_status' => 'employee',
            'changed_by' => optional($request->user())->id,
            'changed_at' => now(),
            'notes' => 'Converted to Employee',
        ]);
        $recruitment->delete();

        return redirect()->route('hr.employees.show', $employee)->with('status', 'Employee created from candidate');
    }

    public function destroy(Recruitment $recruitment): RedirectResponse
    {
        $recruitment->delete();
        return redirect()->route('hr.recruitment.index', [
            'stage' => $request->query('stage', 'interview'),
        ])->with('status', 'Recruitment deleted');
    }

    public function restore(string $id): RedirectResponse
    {
        $rec = Recruitment::onlyTrashed()->findOrFail($id);
        $rec->restore();
        return redirect()->route('hr.recruitment.index', [
            'stage' => 'interview',
            'edit' => $rec->id,
        ])->with('status', 'Recruitment restored');
    }

    public function restoreAll(): RedirectResponse
    {
        Recruitment::onlyTrashed()->restore();
        return back()->with('status', 'All trashed recruitments restored');
    }

    public function forceDelete(string $id): RedirectResponse
    {
        $rec = Recruitment::onlyTrashed()->findOrFail($id);
        $rec->forceDelete();
        return redirect()->route('hr.recruitment.index', [
            'stage' => 'trashed',
        ])->with('status', 'Recruitment permanently deleted');
    }

    public function transitionsExport(Request $request)
    {
        $stage = $request->query('stage');
        $query = \App\Models\RecruitmentTransition::query()
            ->with(['recruitment' => function($q){ $q->withTrashed(); }, 'changedByUser']);
        if (in_array($stage, ['interview','candidate','approved','rejected'])) {
            $query->whereHas('recruitment', function($q) use ($stage){ $q->where('status', $stage); });
        } elseif ($stage === 'trashed') {
            $query->whereHas('recruitment', function($q){ $q->onlyTrashed(); });
        }

        $filename = 'recruitment-audit-'.now()->format('Ymd_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->streamDownload(function() use ($query) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM for Excel
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Recruitment ID','Candidate','Changed At','From','To','Changed By','Notes']);
            $query->orderBy('changed_at','asc')->chunk(500, function($chunk) use ($out){
                foreach ($chunk as $t) {
                    fputcsv($out, [
                        $t->recruitment_id,
                        optional($t->recruitment)->candidate_name,
                        optional($t->changed_at)->toDateTimeString(),
                        $t->from_status,
                        $t->to_status,
                        optional($t->changedByUser)->name,
                        $t->notes,
                    ]);
                }
            });
            fclose($out);
        }, $filename, $headers);
    }
}
