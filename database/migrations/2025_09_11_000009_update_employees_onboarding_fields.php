<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->enum('onboarding_status', ['draft','submitted','approved','rejected'])->default('draft')->after('qr_payload');
            $table->timestamp('onboarding_submitted_at')->nullable()->after('onboarding_status');
            $table->timestamp('documents_received_at')->nullable()->after('onboarding_submitted_at');
            $table->date('lock_at')->nullable()->after('documents_received_at');
            $table->timestamp('grace_approved_at')->nullable()->after('lock_at');
            $table->date('grace_until')->nullable()->after('grace_approved_at');
            $table->boolean('is_locked')->default(false)->after('grace_until');
        });

        Schema::table('employment_details', function (Blueprint $table) {
            $table->date('joining_date')->nullable()->after('effective_date');
            $table->string('zone')->nullable()->after('joining_date');
            $table->json('pjp')->nullable()->after('zone');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'onboarding_status',
                'onboarding_submitted_at',
                'documents_received_at',
                'lock_at',
                'grace_approved_at',
                'grace_until',
                'is_locked',
            ]);
        });

        Schema::table('employment_details', function (Blueprint $table) {
            $table->dropColumn(['joining_date','zone','pjp']);
        });
    }
};

