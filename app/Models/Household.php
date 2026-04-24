<?php

namespace App\Models;

use Database\Factories\HouseholdFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'head_user_id',
    'name',
    'household_code',
    'evacuation_status',
    'evacuation_status_updated_at',
    'household_role',
    'contact_number',
    'sex',
    'age',
    'age_group',
    'is_pwd',
    'pwd_type',
    'pwd_type_other',
    'street_address',
    'barangay',
    'city',
    'hazard_zone',
    'status',
])]
class Household extends Model
{
    /** @use HasFactory<HouseholdFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'evacuation_status_updated_at' => 'datetime',
            'is_pwd' => 'bool',
        ];
    }

    public function headUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_user_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(HouseholdMember::class)->orderBy('sort_order');
    }

    public function evacuationScans(): HasMany
    {
        return $this->hasMany(EvacuationScan::class)->orderByDesc('scanned_at');
    }
}
