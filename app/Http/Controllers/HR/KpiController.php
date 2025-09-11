<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Kpi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KpiController extends Controller
{
    public function index(): Response
    {
        $kpis = Kpi::with('employee')->latest()->paginate(15)->withQueryString();
        return Inertia::render('hr/kpis/index', [
            'kpis' => $kpis,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'period' => ['nullable', 'string', 'max:100'],
            'goals' => ['nullable', 'array'],
            'performance_rating' => ['nullable', 'numeric'],
            'review_notes' => ['nullable', 'string'],
            'trainings' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
        ]);

        Kpi::create($validated);
        return back()->with('status', 'KPI saved');
    }

    public function update(Request $request, Kpi $kpi): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'period' => ['nullable', 'string', 'max:100'],
            'goals' => ['nullable', 'array'],
            'performance_rating' => ['nullable', 'numeric'],
            'review_notes' => ['nullable', 'string'],
            'trainings' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
        ]);

        if (!array_key_exists('employee_id', $validated)) {
            $validated['employee_id'] = $kpi->employee_id;
        }

        $kpi->update($validated);
        return back()->with('status', 'KPI updated');
    }

    public function destroy(Kpi $kpi): RedirectResponse
    {
        $kpi->delete();
        return back()->with('status', 'KPI deleted');
    }
}
