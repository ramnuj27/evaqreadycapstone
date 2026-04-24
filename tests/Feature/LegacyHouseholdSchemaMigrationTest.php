<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('legacy household tables are aligned to the current schema', function () {
    $headUser = User::factory()->create([
        'birthdate' => null,
        'contact_number' => null,
        'gender' => null,
        'is_pregnant' => false,
        'name' => 'Legacy Resident',
    ]);

    Schema::disableForeignKeyConstraints();
    Schema::dropIfExists('household_members');
    Schema::dropIfExists('households');
    Schema::dropIfExists('household_profiles');
    Schema::enableForeignKeyConstraints();

    Schema::create('household_profiles', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->unique();
        $table->string('reference_code')->nullable()->unique();
        $table->string('evacuation_status')->default('registered');
        $table->timestamp('evacuation_status_updated_at')->nullable();
        $table->string('household_role');
        $table->unsignedTinyInteger('age');
        $table->string('age_group');
        $table->string('contact_number', 20);
        $table->string('sex', 10);
        $table->boolean('is_pwd')->default(false);
        $table->string('pwd_type')->nullable();
        $table->string('pwd_type_other')->nullable();
        $table->string('barangay');
        $table->text('address');
        $table->timestamps();
    });

    Schema::create('household_members', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('household_profile_id');
        $table->unsignedSmallInteger('position');
        $table->string('full_name');
        $table->unsignedTinyInteger('age');
        $table->string('age_group');
        $table->string('sex', 10);
        $table->boolean('is_pwd')->default(false);
        $table->string('pwd_type')->nullable();
        $table->string('pwd_type_other')->nullable();
        $table->timestamps();
    });

    DB::table('household_profiles')->insert([
        'id' => 1,
        'user_id' => $headUser->id,
        'reference_code' => 'EVQ-MATI-LEGACY1',
        'evacuation_status' => 'registered',
        'evacuation_status_updated_at' => now(),
        'household_role' => 'head',
        'age' => 34,
        'age_group' => 'adult',
        'contact_number' => '09170001111',
        'sex' => 'female',
        'is_pwd' => false,
        'pwd_type' => null,
        'pwd_type_other' => null,
        'barangay' => 'Dahican',
        'address' => 'Purok 1, Dahican, Mati City',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('household_members')->insert([
        'household_profile_id' => 1,
        'position' => 1,
        'full_name' => 'Legacy Child',
        'age' => 12,
        'age_group' => 'child',
        'sex' => 'male',
        'is_pwd' => true,
        'pwd_type' => 'hearing-impairment',
        'pwd_type_other' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runMigration('2026_04_08_080753_create_household_members_table.php');
    runMigration('2026_04_08_080753_create_households_table.php');
    runMigration('2026_04_08_080822_add_head_of_household_fields_to_users_table.php');
    runMigration('2026_04_08_085515_add_vulnerability_fields_to_users_and_household_members_tables.php');
    runMigration('2026_04_22_121346_drop_age_from_household_members_table.php');

    expect(Schema::hasTable('households'))->toBeTrue();
    expect(Schema::hasTable('household_profiles'))->toBeFalse();
    expect(Schema::hasColumn('households', 'head_user_id'))->toBeTrue();
    expect(Schema::hasColumn('households', 'household_code'))->toBeTrue();
    expect(Schema::hasColumn('households', 'street_address'))->toBeTrue();
    expect(Schema::hasColumn('household_members', 'household_id'))->toBeTrue();
    expect(Schema::hasColumn('household_members', 'sort_order'))->toBeTrue();
    expect(Schema::hasColumn('household_members', 'gender'))->toBeTrue();
    expect(Schema::hasColumn('household_members', 'birthdate'))->toBeTrue();
    expect(Schema::hasColumn('household_members', 'age'))->toBeFalse();
    expect(Schema::hasColumn('users', 'contact_number'))->toBeTrue();
    expect(Schema::hasColumn('users', 'gender'))->toBeTrue();
    expect(Schema::hasColumn('users', 'birthdate'))->toBeTrue();
    expect(Schema::hasColumn('users', 'is_pregnant'))->toBeTrue();

    $household = DB::table('households')->first();
    $member = DB::table('household_members')->first();
    $headUser = DB::table('users')->where('id', $headUser->id)->first();

    expect($household->head_user_id)->toBe($headUser->id)
        ->and($household->household_code)->toBe('EVQ-MATI-LEGACY1')
        ->and($household->name)->toBe('Legacy Resident Household')
        ->and($household->city)->toBe('Mati City')
        ->and($household->hazard_zone)->toBe('safe-zone');

    expect($member->household_id)->toBe($household->id)
        ->and($member->gender)->toBe('male')
        ->and($member->category)->toBe('Child')
        ->and($member->is_pregnant)->toBe(0)
        ->and($member->birthdate)->toBe(now()->subYears(12)->startOfYear()->toDateString())
        ->and($member->pwd_type)->toBe('hearing-impairment');

    expect($headUser->contact_number)->toBe('09170001111')
        ->and($headUser->gender)->toBe('female')
        ->and($headUser->birthdate)->toBe(now()->subYears(34)->startOfYear()->toDateString());
});

function runMigration(string $filename): void
{
    /** @var Migration $migration */
    $migration = require database_path("migrations/{$filename}");
    $migration->up();
}
