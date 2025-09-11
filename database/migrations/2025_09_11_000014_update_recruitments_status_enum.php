<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Only apply on MySQL/MariaDB, where ENUM needs explicit ALTER
        $driver = DB::getDriverName();
        if (!in_array($driver, ['mysql'])) {
            return; // SQLite/Postgres ignore
        }

        // Extend enum to include 'candidate' and 'approved'
        DB::statement("ALTER TABLE `recruitments` MODIFY `status` ENUM('applied','interview','candidate','approved','offer','hired','rejected') NOT NULL DEFAULT 'applied'");
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if (!in_array($driver, ['mysql'])) {
            return;
        }

        // Coerce any values not supported by the original enum back to a valid value
        DB::statement("UPDATE `recruitments` SET `status`='interview' WHERE `status` IN ('candidate','approved')");

        // Revert enum to original set
        DB::statement("ALTER TABLE `recruitments` MODIFY `status` ENUM('applied','interview','offer','hired','rejected') NOT NULL DEFAULT 'applied'");
    }
};

