<?php

namespace App\Models;

use Database\Factories\HouseholdMemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'household_id',
    'full_name',
    'gender',
    'birthdate',
    'category',
    'is_pwd',
    'pwd_type',
    'pwd_type_other',
    'is_pregnant',
    'sort_order',
])]
class HouseholdMember extends Model
{
    /** @use HasFactory<HouseholdMemberFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'is_pwd' => 'bool',
            'is_pregnant' => 'bool',
        ];
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}
