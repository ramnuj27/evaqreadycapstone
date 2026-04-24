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
        if (
            ! Schema::hasTable('household_members')
            || ! Schema::hasColumn('household_members', 'age')
        ) {
            return;
        }

        Schema::table('household_members', function (Blueprint $table) {
            $table->dropColumn('age');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (
            ! Schema::hasTable('household_members')
            || Schema::hasColumn('household_members', 'age')
        ) {
            return;
        }

        Schema::table('household_members', function (Blueprint $table) {
            $table->unsignedTinyInteger('age')->nullable()->after('full_name');
        });
    }
};
