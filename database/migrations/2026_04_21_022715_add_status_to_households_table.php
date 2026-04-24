<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('households', 'status')) {
            Schema::table('households', function (Blueprint $table) {
                $table->string('status', 20)->default('Active')->after('hazard_zone');
            });
        }

        DB::table('households')
            ->whereNull('status')
            ->orWhere('status', '')
            ->update(['status' => 'Active']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('households', 'status')) {
            Schema::table('households', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
