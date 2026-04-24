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
        if (! Schema::hasTable('households')) {
            return;
        }

        Schema::table('households', function (Blueprint $table) {
            if (! Schema::hasColumn('households', 'household_role')) {
                $table->string('household_role')->nullable()->default('Head of Family');
            }

            if (! Schema::hasColumn('households', 'contact_number')) {
                $table->string('contact_number', 24)->nullable();
            }

            if (! Schema::hasColumn('households', 'sex')) {
                $table->string('sex', 20)->nullable();
            }

            if (! Schema::hasColumn('households', 'age')) {
                $table->integer('age')->nullable();
            }

            if (! Schema::hasColumn('households', 'age_group')) {
                $table->string('age_group', 64)->nullable();
            }

            if (! Schema::hasColumn('households', 'is_pwd')) {
                $table->boolean('is_pwd')->default(false);
            }

            if (! Schema::hasColumn('households', 'pwd_type')) {
                $table->string('pwd_type', 64)->nullable();
            }

            if (! Schema::hasColumn('households', 'pwd_type_other')) {
                $table->string('pwd_type_other')->nullable();
            }

            if (! Schema::hasColumn('households', 'evacuation_status')) {
                $table->string('evacuation_status', 40)->nullable();
            }

            if (! Schema::hasColumn('households', 'evacuation_status_updated_at')) {
                $table->timestamp('evacuation_status_updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('households')) {
            return;
        }

        $columns = [
            'evacuation_status_updated_at',
            'evacuation_status',
            'pwd_type_other',
            'pwd_type',
            'is_pwd',
            'age_group',
            'age',
            'sex',
            'contact_number',
            'household_role',
        ];

        foreach ($columns as $column) {
            if (Schema::hasColumn('households', $column)) {
                Schema::table('households', function (Blueprint $table) use ($column): void {
                    $table->dropColumn($column);
                });
            }
        }
    }
};
