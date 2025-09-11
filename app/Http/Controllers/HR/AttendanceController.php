<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $records = AttendanceRecord::with(['employee', 'schedule'])->latest('work_date')->paginate(20)->withQueryString();
        return Inertia::render('hr/attendance/index', [
            'records' => $records,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'work_date' => ['required', 'date'],
            'clock_in' => ['nullable'],
            'clock_out' => ['nullable'],
            'work_schedule_id' => ['nullable', 'exists:work_schedules,id'],
            'status' => ['required', 'in:present,absent,on_leave,holiday'],
            'leave_type' => ['nullable', 'string', 'max:100'],
        ]);

        AttendanceRecord::create($validated);
        return back()->with('status', 'Attendance saved');
    }

    public function update(Request $request, AttendanceRecord $attendance): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'work_date' => ['required', 'date'],
            'clock_in' => ['nullable'],
            'clock_out' => ['nullable'],
            'work_schedule_id' => ['nullable', 'exists:work_schedules,id'],
            'status' => ['required', 'in:present,absent,on_leave,holiday'],
            'leave_type' => ['nullable', 'string', 'max:100'],
        ]);
        if (!array_key_exists('employee_id', $validated)) {
            $validated['employee_id'] = $attendance->employee_id;
        }
        $attendance->update($validated);
        return back()->with('status', 'Attendance updated');
    }

    public function destroy(AttendanceRecord $attendance): RedirectResponse
    {
        $attendance->delete();
        return back()->with('status', 'Attendance deleted');
    }
}
