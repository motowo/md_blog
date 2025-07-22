<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditCard extends Model
{
    protected $fillable = [
        'user_id',
        'card_number',
        'card_name',
        'expiry_month',
        'expiry_year',
        'last_four',
        'card_brand',
        'is_default',
    ];

    protected $hidden = [
        'card_number', // セキュリティのため、レスポンスに含めない
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * カードを所有するユーザー
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * カード番号から下4桁を取得
     */
    public function setCardNumberAttribute($value): void
    {
        $this->attributes['card_number'] = $value;
        $this->attributes['last_four'] = substr($value, -4);

        // カードブランドを判定（簡易版）
        $firstDigit = substr($value, 0, 1);
        if ($firstDigit === '4') {
            $this->attributes['card_brand'] = 'VISA';
        } elseif ($firstDigit === '5') {
            $this->attributes['card_brand'] = 'Mastercard';
        } elseif ($firstDigit === '3') {
            $this->attributes['card_brand'] = 'AMEX';
        } else {
            $this->attributes['card_brand'] = 'Other';
        }
    }

    /**
     * カード情報をマスク表示用にフォーマット
     */
    public function getMaskedCardNumberAttribute(): string
    {
        return '**** **** **** '.$this->last_four;
    }
}
