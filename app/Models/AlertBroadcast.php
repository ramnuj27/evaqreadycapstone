<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'audio_enabled',
    'audio_url',
    'created_by_user_id',
    'issued_at',
    'message',
    'scheduled_for',
    'severity',
    'status',
    'target_barangay',
    'title',
    'type',
])]
class AlertBroadcast extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'audio_enabled' => 'bool',
            'issued_at' => 'datetime',
            'scheduled_for' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
