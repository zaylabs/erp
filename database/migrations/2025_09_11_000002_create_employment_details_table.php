<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->foreignId('reporting_manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->enum('employment_status', ['full-time', 'part-time', 'contractor'])->default('full-time');
            $table->string('position')->nullable();
            $table->string('pay_grade')->nullable();
            $table->decimal('pay', 12, 2)->nullable();
            $table->decimal('allowances', 12, 2)->nullable();
            $table->decimal('transport', 12, 2)->nullable();
            $table->decimal('other_allowances', 12, 2)->nullable();
            $table->date('effective_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employment_details');
    }
};

