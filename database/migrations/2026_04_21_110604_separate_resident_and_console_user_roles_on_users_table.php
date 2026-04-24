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
        DB::table('users')
            ->where(function ($query): void {
                $query->whereNull('role')
                    ->orWhere('role', 'Operator');
            })
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('households')
                    ->whereColumn('households.head_user_id', 'users.id');
            })
            ->update([
                'role' => 'Resident',
            ]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Resident')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Operator')->change();
        });

        DB::table('users')
            ->where('role', 'Resident')
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('households')
                    ->whereColumn('households.head_user_id', 'users.id');
            })
            ->update([
                'role' => 'Operator',
            ]);
    }
};
