<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recruitments', function (Blueprint $table) {
            $table->id();
            $table->string('candidate_name');
            $table->date('application_date')->nullable();
            $table->json('application_details')->nullable();
            $table->string('resume_path')->nullable();
            $table->text('interview_notes')->nullable();
            $table->json('onboarding_checklist')->nullable();
            $table->enum('status', ['applied', 'interview', 'offer', 'hired', 'rejected'])->default('applied');
            $table->foreignId('new_hire_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitments');
    }
};

