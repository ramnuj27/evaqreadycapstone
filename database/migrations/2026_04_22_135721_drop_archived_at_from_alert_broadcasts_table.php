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
        DB::table('alert_broadcasts')
            ->where('status', 'Archived')
            ->delete();

        if (! Schema::hasColumn('alert_broadcasts', 'archived_at')) {
            return;
        }

        Schema::table('alert_broadcasts', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('alert_broadcasts', 'archived_at')) {
            return;
        }

        Schema::table('alert_broadcasts', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });
    }
};
