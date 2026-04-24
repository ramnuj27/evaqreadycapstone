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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'contact_number')) {
                $table->string('contact_number', 24)->nullable()->after('email');
            }

            if (! Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 20)->nullable()->after('contact_number');
            }

            if (! Schema::hasColumn('users', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('gender');
            }
        });

        if (! Schema::hasTable('households')) {
            return;
        }

        $columns = ['id', 'head_user_id'];

        if (Schema::hasColumn('households', 'contact_number')) {
            $columns[] = 'contact_number';
        }

        if (Schema::hasColumn('households', 'sex')) {
            $columns[] = 'sex';
        }

        if (Schema::hasColumn('households', 'age')) {
            $columns[] = 'age';
        }

        $households = DB::table('households')
            ->select($columns)
            ->orderBy('id')
            ->get();

        foreach ($households as $household) {
            $updates = [];

            if (
                property_exists($household, 'contact_number')
                && filled($household->contact_number ?? null)
            ) {
                $updates['contact_number'] = $household->contact_number;
            }

            if (property_exists($household, 'sex') && filled($household->sex ?? null)) {
                $updates['gender'] = strtolower((string) $household->sex) === 'female'
                    ? 'female'
                    : 'male';
            }

            if (property_exists($household, 'age') && is_numeric($household->age ?? null)) {
                $updates['birthdate'] = now()
                    ->subYears((int) $household->age)
                    ->startOfYear()
                    ->toDateString();
            }

            if ($updates !== []) {
                DB::table('users')
                    ->where('id', $household->head_user_id)
                    ->update(array_filter(
                        $updates,
                        fn ($value): bool => filled($value),
                    ));
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = array_values(array_filter([
                Schema::hasColumn('users', 'contact_number') ? 'contact_number' : null,
                Schema::hasColumn('users', 'gender') ? 'gender' : null,
                Schema::hasColumn('users', 'birthdate') ? 'birthdate' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
