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
        if (! Schema::hasColumn('households', 'household_role')) {
            return;
        }

        Schema::table('households', function (Blueprint $table) {
            $table->string('household_role')->nullable()->default('Head of Family')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('households', 'household_role')) {
            return;
        }

        Schema::table('households', function (Blueprint $table) {
            $table->string('household_role')->nullable(false)->default(null)->change();
        });
    }
};
