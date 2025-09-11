<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // HR Module Routes
    Route::prefix('hr')->name('hr.')->group(function () {
        Route::get('/', [\App\Http\Controllers\HR\HrController::class, 'index'])->name('overview');

        Route::get('/employees', [\App\Http\Controllers\HR\EmployeeController::class, 'index'])->name('employees.index');
        Route::post('/employees', [\App\Http\Controllers\HR\EmployeeController::class, 'store'])->name('employees.store');
        Route::get('/employees/{employee}', [\App\Http\Controllers\HR\EmployeeController::class, 'show'])->name('employees.show');
        Route::put('/employees/{employee}', [\App\Http\Controllers\HR\EmployeeController::class, 'update'])->name('employees.update');
        Route::delete('/employees/{employee}', [\App\Http\Controllers\HR\EmployeeController::class, 'destroy'])->name('employees.destroy');
        Route::post('/employees/{employee}/employment', [\App\Http\Controllers\HR\EmployeeController::class, 'addEmploymentDetail'])->name('employees.employment.store');
        Route::delete('/employees/{employee}/employment/{employmentDetail}', [\App\Http\Controllers\HR\EmployeeController::class, 'deleteEmploymentDetail'])->name('employees.employment.destroy');

        // Onboarding workflow
        Route::post('/employees/{employee}/submit', [\App\Http\Controllers\HR\EmployeeController::class, 'submitForReview'])->name('employees.submit');
        Route::post('/employees/{employee}/documents/received', [\App\Http\Controllers\HR\EmployeeController::class, 'markDocumentsReceived'])->name('employees.documents.received');
        Route::post('/employees/{employee}/approve-grace', [\App\Http\Controllers\HR\EmployeeController::class, 'approveGrace'])->name('employees.approve_grace');
        Route::post('/employees/{employee}/create-login', [\App\Http\Controllers\HR\EmployeeController::class, 'createLogin'])->name('employees.create_login');
        Route::post('/onboarding/run-lock-check', [\App\Http\Controllers\HR\EmployeeController::class, 'runLockCheck'])->name('onboarding.lock_check');

        // Employee documents
        Route::post('/employees/{employee}/documents', [\App\Http\Controllers\HR\EmployeeDocumentController::class, 'store'])->name('employees.documents.store');
        Route::delete('/employees/{employee}/documents/{document}', [\App\Http\Controllers\HR\EmployeeDocumentController::class, 'destroy'])->name('employees.documents.destroy');

        Route::get('/attendance', [\App\Http\Controllers\HR\AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance', [\App\Http\Controllers\HR\AttendanceController::class, 'store'])->name('attendance.store');
        Route::put('/attendance/{attendance}', [\App\Http\Controllers\HR\AttendanceController::class, 'update'])->name('attendance.update');
        Route::delete('/attendance/{attendance}', [\App\Http\Controllers\HR\AttendanceController::class, 'destroy'])->name('attendance.destroy');

        Route::get('/payroll', [\App\Http\Controllers\HR\PayrollController::class, 'index'])->name('payroll.index');
        Route::post('/payroll', [\App\Http\Controllers\HR\PayrollController::class, 'store'])->name('payroll.store');
        Route::put('/payroll/{payroll}', [\App\Http\Controllers\HR\PayrollController::class, 'update'])->name('payroll.update');
        Route::delete('/payroll/{payroll}', [\App\Http\Controllers\HR\PayrollController::class, 'destroy'])->name('payroll.destroy');

        Route::get('/kpis', [\App\Http\Controllers\HR\KpiController::class, 'index'])->name('kpis.index');
        Route::post('/kpis', [\App\Http\Controllers\HR\KpiController::class, 'store'])->name('kpis.store');
        Route::put('/kpis/{kpi}', [\App\Http\Controllers\HR\KpiController::class, 'update'])->name('kpis.update');
        Route::delete('/kpis/{kpi}', [\App\Http\Controllers\HR\KpiController::class, 'destroy'])->name('kpis.destroy');

        Route::get('/recruitment', [\App\Http\Controllers\HR\RecruitmentController::class, 'index'])->name('recruitment.index');
        Route::get('/recruitment/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'show'])->name('recruitment.show');
        Route::post('/recruitment', [\App\Http\Controllers\HR\RecruitmentController::class, 'store'])->name('recruitment.store');
        Route::put('/recruitment/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'update'])->name('recruitment.update');
        Route::delete('/recruitment/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'destroy'])->name('recruitment.destroy');
        Route::post('/recruitment/{recruitment}/approve', [\App\Http\Controllers\HR\RecruitmentController::class, 'approve'])->name('recruitment.approve');
        Route::post('/recruitment/{recruitment}/convert', [\App\Http\Controllers\HR\RecruitmentController::class, 'convertToEmployee'])->name('recruitment.convert');
        Route::post('/recruitment/{id}/restore', [\App\Http\Controllers\HR\RecruitmentController::class, 'restore'])->name('recruitment.restore');
        Route::post('/recruitment/restore-all', [\App\Http\Controllers\HR\RecruitmentController::class, 'restoreAll'])->name('recruitment.restore_all');
        Route::post('/recruitment/{id}/force-delete', [\App\Http\Controllers\HR\RecruitmentController::class, 'forceDelete'])->name('recruitment.force_delete');
        Route::get('/recruitment/transitions-export', [\App\Http\Controllers\HR\RecruitmentController::class, 'transitionsExport'])->name('recruitment.transitions_export');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
