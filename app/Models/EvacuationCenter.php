<?php

namespace App\Models;

use Database\Factories\EvacuationCenterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'barangay',
    'capacity',
    'detail',
    'is_active',
])]
class EvacuationCenter extends Model
{
    /** @use HasFactory<EvacuationCenterFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capacity' => 'int',
            'is_active' => 'bool',
        ];
    }
}
