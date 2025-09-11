<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('period')->nullable(); // e.g. 2025-Q3
            $table->json('goals')->nullable();
            $table->decimal('performance_rating', 5, 2)->nullable();
            $table->text('review_notes')->nullable();
            $table->json('trainings')->nullable();
            $table->json('skills')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpis');
    }
};

