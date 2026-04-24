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
        if (Schema::hasTable('household_profiles') && ! Schema::hasTable('households')) {
            $this->dropLegacyUserForeignKey();

            Schema::rename('household_profiles', 'households');
        }

        if (! Schema::hasTable('households')) {
            Schema::create('households', function (Blueprint $table) {
                $table->id();
                $table->foreignId('head_user_id')->unique();
                $table->string('name');
                $table->string('household_code', 24)->unique();
                $table->string('street_address');
                $table->string('barangay');
                $table->string('city');
                $table->string('hazard_zone');
                $table->timestamps();
            });
        } else {
            Schema::table('households', function (Blueprint $table) {
                if (Schema::hasColumn('households', 'user_id')) {
                    $table->renameColumn('user_id', 'head_user_id');
                }

                if (Schema::hasColumn('households', 'reference_code')) {
                    $table->renameColumn('reference_code', 'household_code');
                }

                if (Schema::hasColumn('households', 'address')) {
                    $table->renameColumn('address', 'street_address');
                }
            });

            Schema::table('households', function (Blueprint $table) {
                if (! Schema::hasColumn('households', 'name')) {
                    $table->string('name')->nullable()->after('head_user_id');
                }

                if (! Schema::hasColumn('households', 'city')) {
                    $table->string('city')->nullable()->after('barangay');
                }

                if (! Schema::hasColumn('households', 'hazard_zone')) {
                    $table->string('hazard_zone')->nullable()->after('city');
                }
            });
        }

        $userNames = DB::table('users')->pluck('name', 'id');

        DB::table('households')
            ->select(['id', 'head_user_id', 'name', 'household_code', 'barangay', 'city', 'hazard_zone'])
            ->orderBy('id')
            ->get()
            ->each(function (object $household) use ($userNames): void {
                $updates = [];

                if (blank($household->name ?? null)) {
                    $headName = $userNames[$household->head_user_id] ?? 'Resident';
                    $updates['name'] = "{$headName} Household";
                }

                if (blank($household->household_code ?? null)) {
                    $updates['household_code'] = sprintf('EVQ-LEGACY-%06d', $household->id);
                }

                if (blank($household->city ?? null)) {
                    $updates['city'] = 'Mati City';
                }

                if (blank($household->hazard_zone ?? null)) {
                    $updates['hazard_zone'] = 'safe-zone';
                }

                if ($updates !== []) {
                    DB::table('households')
                        ->where('id', $household->id)
                        ->update($updates);
                }
            });

        $this->addHouseholdConstraints();
        $this->addHouseholdMemberConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('households');
    }

    private function addHouseholdConstraints(): void
    {
        Schema::table('households', function (Blueprint $table) {
            if (! $this->hasForeignKey('households', 'households_head_user_id_foreign')) {
                $table->foreign('head_user_id')->references('id')->on('users')->cascadeOnDelete();
            }
        });
    }

    private function addHouseholdMemberConstraints(): void
    {
        if (
            ! Schema::hasTable('household_members')
            || ! Schema::hasColumn('household_members', 'household_id')
        ) {
            return;
        }

        Schema::table('household_members', function (Blueprint $table) {
            if (! $this->hasIndex('household_members', 'household_members_household_id_sort_order_index')) {
                $table->index(['household_id', 'sort_order']);
            }

            if (! $this->hasForeignKey('household_members', 'household_members_household_id_foreign')) {
                $table->foreign('household_id')->references('id')->on('households')->cascadeOnDelete();
            }
        });
    }

    private function dropLegacyUserForeignKey(): void
    {
        if (
            Schema::getConnection()->getDriverName() !== 'mysql'
            || ! Schema::hasTable('household_profiles')
            || ! Schema::hasColumn('household_profiles', 'user_id')
        ) {
            return;
        }

        $foreignKeys = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('CONSTRAINT_NAME')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', 'household_profiles')
            ->where('COLUMN_NAME', 'user_id')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->get();

        foreach ($foreignKeys as $foreignKey) {
            DB::statement("ALTER TABLE household_profiles DROP FOREIGN KEY `{$foreignKey->CONSTRAINT_NAME}`");
        }
    }

    private function hasForeignKey(string $table, string $constraint): bool
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return false;
        }

        return DB::table('information_schema.TABLE_CONSTRAINTS')
            ->whereRaw('CONSTRAINT_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', $table)
            ->where('CONSTRAINT_NAME', $constraint)
            ->where('CONSTRAINT_TYPE', 'FOREIGN KEY')
            ->exists();
    }

    private function hasIndex(string $table, string $index): bool
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return false;
        }

        return DB::table('information_schema.STATISTICS')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', $table)
            ->where('INDEX_NAME', $index)
            ->exists();
    }
};
