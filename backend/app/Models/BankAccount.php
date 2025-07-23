<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bank_name',
        'branch_name',
        'account_type',
        'account_number',
        'account_holder_name',
        'is_active',
        'verified_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * 口座所有者
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 有効な口座のみを取得
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * 確認済みの口座のみを取得
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * 口座番号をマスクして取得
     */
    public function getMaskedAccountNumberAttribute()
    {
        if (strlen($this->account_number) <= 4) {
            return $this->account_number;
        }

        return str_repeat('*', strlen($this->account_number) - 4).substr($this->account_number, -4);
    }

    /**
     * 表示用の口座情報を取得
     */
    public function getDisplayNameAttribute()
    {
        return "{$this->bank_name} {$this->branch_name} ({$this->account_type}) {$this->masked_account_number}";
    }
}
