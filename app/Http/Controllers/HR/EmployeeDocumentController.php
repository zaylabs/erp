<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentController extends Controller
{
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'document' => ['required', 'file', 'mimes:pdf', 'max:8192'],
            'type' => ['required', 'in:CV,CNIC,Certificate'],
        ]);

        // Ensure one file per required type; replace if exists
        $existing = EmployeeDocument::where('employee_id', $employee->id)
            ->where('type', $validated['type'])
            ->first();

        $path = $request->file('document')->store('employee-docs', 'public');

        if ($existing) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($existing->file_path);
            $existing->update([
                'file_path' => $path,
                'uploaded_by' => $request->user()?->id,
            ]);
        } else {
            EmployeeDocument::create([
                'employee_id' => $employee->id,
                'type' => $validated['type'],
                'file_path' => $path,
                'uploaded_by' => $request->user()?->id,
            ]);
        }

        return back()->with('status', 'Document uploaded');
    }

    public function destroy(Employee $employee, EmployeeDocument $document): RedirectResponse
    {
        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('status', 'Document deleted');
    }
}
