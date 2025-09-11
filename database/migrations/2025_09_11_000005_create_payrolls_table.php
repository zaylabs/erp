<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('salary', 12, 2)->nullable();
            $table->decimal('hourly_wage', 12, 2)->nullable();
            $table->json('tax_information')->nullable();
            $table->json('bank_account_details')->nullable();
            $table->json('benefits')->nullable();
            $table->decimal('total_compensation', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};

