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
        'mime_type',
        'file_size',
        'width',
        'height',
        'crop_data',
        'is_active',
        'base64_data',
    ];

    protected $casts = [
        'crop_data' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'base64_data', // 大きなデータなのでデフォルトでは隠す
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
        // BASE64データを返す
        if ($this->base64_data) {
            return $this->base64_data;
        }

        return '';
    }

    /**
     * Scope to get only active avatar files.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
