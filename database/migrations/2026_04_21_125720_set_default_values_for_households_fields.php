<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->changeColumnIfExists(
            'age',
            fn (Blueprint $table): mixed => $table->integer('age')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'age_group',
            fn (Blueprint $table): mixed => $table->string('age_group')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'contact_number',
            fn (Blueprint $table): mixed => $table->string('contact_number')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'sex',
            fn (Blueprint $table): mixed => $table->string('sex')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'is_pwd',
            fn (Blueprint $table): mixed => $table->boolean('is_pwd')->default(false)->change(),
        );
        $this->changeColumnIfExists(
            'pwd_type',
            fn (Blueprint $table): mixed => $table->string('pwd_type')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'pwd_type_other',
            fn (Blueprint $table): mixed => $table->string('pwd_type_other')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'evacuation_status',
            fn (Blueprint $table): mixed => $table->string('evacuation_status')->nullable()->change(),
        );
        $this->changeColumnIfExists(
            'evacuation_status_updated_at',
            fn (Blueprint $table): mixed => $table->timestamp('evacuation_status_updated_at')->nullable()->change(),
        );
    }

    public function down(): void
    {
        $this->changeColumnIfExists(
            'age',
            fn (Blueprint $table): mixed => $table->integer('age')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'age_group',
            fn (Blueprint $table): mixed => $table->string('age_group')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'contact_number',
            fn (Blueprint $table): mixed => $table->string('contact_number')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'sex',
            fn (Blueprint $table): mixed => $table->string('sex')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'is_pwd',
            fn (Blueprint $table): mixed => $table->boolean('is_pwd')->default(null)->change(),
        );
        $this->changeColumnIfExists(
            'pwd_type',
            fn (Blueprint $table): mixed => $table->string('pwd_type')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'pwd_type_other',
            fn (Blueprint $table): mixed => $table->string('pwd_type_other')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'evacuation_status',
            fn (Blueprint $table): mixed => $table->string('evacuation_status')->nullable(false)->change(),
        );
        $this->changeColumnIfExists(
            'evacuation_status_updated_at',
            fn (Blueprint $table): mixed => $table->timestamp('evacuation_status_updated_at')->nullable(false)->change(),
        );
    }

    private function changeColumnIfExists(string $column, \Closure $change): void
    {
        if (! Schema::hasColumn('households', $column)) {
            return;
        }

        Schema::table('households', function (Blueprint $table) use ($change): void {
            $change($table);
        });
    }
};
