<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('evacuation_scans', function (Blueprint $table) {
            $table->json('attendee_refs')->nullable()->after('evacuation_center_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evacuation_scans', function (Blueprint $table) {
            $table->dropColumn('attendee_refs');
        });
    }
};
