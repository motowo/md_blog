<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'rate',
        'applicable_from',
        'applicable_to',
        'is_active',
        'description',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'applicable_from' => 'date',
        'applicable_to' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * 指定日時点で有効な手数料設定を取得
     *
     * @param string $date Y-m-d形式の日付
     * @return CommissionSetting|null
     */
    public static function getActiveSettingForDate($date)
    {
        return self::where('is_active', true)
            ->where('applicable_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('applicable_to')
                    ->orWhere('applicable_to', '>=', $date);
            })
            ->orderBy('applicable_from', 'desc')
            ->first();
    }

    /**
     * 現在有効な手数料設定を取得
     *
     * @return CommissionSetting|null
     */
    public static function getCurrentSetting()
    {
        return self::getActiveSettingForDate(now()->format('Y-m-d'));
    }
}
