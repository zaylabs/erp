<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\Kpi;
use App\Models\Payroll;
use App\Models\Recruitment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrController extends Controller
{
    public function index(Request $request): Response
    {
        $employees = Employee::with(['employmentDetails' => function ($q) {
            $q->latest('effective_date')->limit(1);
        }])->latest()->paginate(10)->withQueryString();

        $attendance = AttendanceRecord::with('employee')->latest('work_date')->limit(10)->get();
        $payrolls = Payroll::with('employee')->latest('period_end')->limit(10)->get();
        $kpis = Kpi::with('employee')->latest('created_at')->limit(10)->get();
        $recruitments = Recruitment::latest()->limit(10)->get();

        return Inertia::render('hr/overview', [
            'employees' => $employees,
            'attendance' => $attendance,
            'payrolls' => $payrolls,
            'kpis' => $kpis,
            'recruitments' => $recruitments,
        ]);
    }
}

