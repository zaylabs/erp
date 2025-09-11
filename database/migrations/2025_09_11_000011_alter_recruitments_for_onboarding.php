<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitments', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('candidate_name');
            $table->string('cnic')->nullable()->after('father_name');
            $table->text('work_experience')->nullable()->after('cnic');
            $table->string('address')->nullable()->after('work_experience');
            $table->string('phone')->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            // reuse resume_path as CV path; ensure it stays
            $table->boolean('interviewer_suitable')->nullable()->after('interview_notes');
            $table->text('interviewer_comments')->nullable()->after('interviewer_suitable');
            $table->decimal('expected_pay', 12, 2)->nullable()->after('interviewer_comments');
            $table->timestamp('hr_approved_at')->nullable()->after('status');
            $table->foreignId('hr_approved_by')->nullable()->after('hr_approved_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('recruitments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('hr_approved_by');
            $table->dropColumn([
                'father_name','cnic','work_experience','address','phone','email',
                'interviewer_suitable','interviewer_comments','expected_pay',
                'hr_approved_at',
            ]);
        });
    }
};

