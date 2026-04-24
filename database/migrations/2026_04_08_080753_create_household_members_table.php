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
        if (! Schema::hasTable('household_members')) {
            Schema::create('household_members', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('household_id');
                $table->string('full_name');
                $table->string('gender', 20);
                $table->date('birthdate');
                $table->string('category', 20);
                $table->boolean('is_pwd')->default(false);
                $table->boolean('is_pregnant')->default(false);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });

            return;
        }

        $this->dropLegacyForeignKey();

        Schema::table('household_members', function (Blueprint $table) {
            if (Schema::hasColumn('household_members', 'household_profile_id')) {
                $table->renameColumn('household_profile_id', 'household_id');
            }

            if (Schema::hasColumn('household_members', 'position')) {
                $table->renameColumn('position', 'sort_order');
            }

            if (Schema::hasColumn('household_members', 'sex')) {
                $table->renameColumn('sex', 'gender');
            }

            if (Schema::hasColumn('household_members', 'age_group')) {
                $table->renameColumn('age_group', 'category');
            }
        });

        Schema::table('household_members', function (Blueprint $table) {
            if (! Schema::hasColumn('household_members', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('gender');
            }

            if (! Schema::hasColumn('household_members', 'is_pregnant')) {
                $table->boolean('is_pregnant')->default(false)->after('is_pwd');
            }
        });

        DB::table('household_members')
            ->select(['id', 'age', 'birthdate', 'category'])
            ->orderBy('id')
            ->get()
            ->each(function (object $member): void {
                $updates = [];

                if ($member->birthdate === null) {
                    $updates['birthdate'] = $this->approximateBirthdate(
                        is_numeric($member->age ?? null) ? (int) $member->age : null,
                    );
                }

                $updates['category'] = $this->normalizeCategory(
                    is_string($member->category ?? null) ? $member->category : null,
                    is_numeric($member->age ?? null) ? (int) $member->age : null,
                );

                if ($updates !== []) {
                    DB::table('household_members')
                        ->where('id', $member->id)
                        ->update($updates);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }

    private function approximateBirthdate(?int $age): ?string
    {
        if ($age === null) {
            return null;
        }

        return now()->subYears($age)->startOfYear()->toDateString();
    }

    private function dropLegacyForeignKey(): void
    {
        if (
            Schema::getConnection()->getDriverName() !== 'mysql'
            || ! Schema::hasColumn('household_members', 'household_profile_id')
        ) {
            return;
        }

        $foreignKeys = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->select('CONSTRAINT_NAME')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', 'household_members')
            ->where('COLUMN_NAME', 'household_profile_id')
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->get();

        foreach ($foreignKeys as $foreignKey) {
            DB::statement("ALTER TABLE household_members DROP FOREIGN KEY `{$foreignKey->CONSTRAINT_NAME}`");
        }

        $legacyIndexExists = DB::table('information_schema.STATISTICS')
            ->whereRaw('TABLE_SCHEMA = DATABASE()')
            ->where('TABLE_NAME', 'household_members')
            ->where('INDEX_NAME', 'household_members_household_profile_id_position_index')
            ->exists();

        if ($legacyIndexExists) {
            DB::statement('ALTER TABLE household_members DROP INDEX `household_members_household_profile_id_position_index`');
        }
    }

    private function normalizeCategory(?string $category, ?int $age): string
    {
        return match (strtolower((string) $category)) {
            'child' => 'Child',
            'adult' => 'Adult',
            'senior' => 'Senior',
            default => match (true) {
                $age !== null && $age >= 60 => 'Senior',
                $age !== null && $age >= 18 => 'Adult',
                default => 'Child',
            },
        };
    }
};
