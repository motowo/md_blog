<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvatarFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_filename',
        'file_path',
        'mime_type',
        'file_size',
        'width',
        'height',
        'crop_data',
        'is_active',
    ];

    protected $casts = [
        'crop_data' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the avatar file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL for the avatar file.
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Scope to get only active avatar files.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
