<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'period',
        'amount',
        'gross_amount',
        'commission_amount',
        'commission_rate',
        'status',
        'paid_at',
        'bank_account_info',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gross_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'paid_at' => 'datetime',
        'bank_account_info' => 'json',
    ];

    /**
     * 支払い対象のユーザー
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 未払いの支払いのみを取得
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    /**
     * 支払い済みの支払いのみを取得
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
