<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitments', function (Blueprint $table) {
            if (!Schema::hasColumn('recruitments', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('recruitments', 'status_changed_by')) {
                $table->foreignId('status_changed_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('recruitments', 'status_changed_at')) {
                $table->timestamp('status_changed_at')->nullable()->after('status_changed_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('recruitments', function (Blueprint $table) {
            if (Schema::hasColumn('recruitments', 'status_changed_by')) {
                $table->dropConstrainedForeignId('status_changed_by');
            }
            if (Schema::hasColumn('recruitments', 'status_changed_at')) {
                $table->dropColumn('status_changed_at');
            }
            if (Schema::hasColumn('recruitments', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};

