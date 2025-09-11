<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function index(): Response
    {
        $payrolls = Payroll::with('employee')->latest('period_end')->paginate(15)->withQueryString();
        return Inertia::render('hr/payroll/index', [
            'payrolls' => $payrolls,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'salary' => ['nullable', 'numeric'],
            'hourly_wage' => ['nullable', 'numeric'],
            'tax_information' => ['nullable', 'array'],
            'bank_account_details' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'total_compensation' => ['nullable', 'numeric'],
        ]);

        Payroll::create($validated);
        return back()->with('status', 'Payroll saved');
    }

    public function update(Request $request, Payroll $payroll): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'salary' => ['nullable', 'numeric'],
            'hourly_wage' => ['nullable', 'numeric'],
            'tax_information' => ['nullable', 'array'],
            'bank_account_details' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'total_compensation' => ['nullable', 'numeric'],
        ]);

        if (!array_key_exists('employee_id', $validated)) {
            $validated['employee_id'] = $payroll->employee_id;
        }

        $payroll->update($validated);
        return back()->with('status', 'Payroll updated');
    }

    public function destroy(Payroll $payroll): RedirectResponse
    {
        $payroll->delete();
        return back()->with('status', 'Payroll deleted');
    }
}
