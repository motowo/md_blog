<?php

namespace App\Helpers;

use Carbon\Carbon;

class TimeZoneHelper
{
    const JAPAN_TIMEZONE = 'Asia/Tokyo';

    /**
     * UTC日時をJSTに変換
     */
    public static function toJST($dateTime, $includeSeconds = true): ?string
    {
        if (! $dateTime) {
            return null;
        }

        if (is_string($dateTime)) {
            $dateTime = Carbon::parse($dateTime);
        }

        $format = $includeSeconds ? 'Y-m-d H:i:s' : 'Y-m-d H:i';

        return $dateTime->setTimezone(self::JAPAN_TIMEZONE)->format($format);
    }

    /**
     * JST基準でのSQLフィルタ用のCONVERT_TZ関数
     */
    public static function convertToJSTSql(string $column): string
    {
        return "CONVERT_TZ({$column}, '+00:00', '+09:00')";
    }

    /**
     * JST基準での月フィルタ用のDATE_FORMAT関数
     */
    public static function monthFilterSql(string $column): string
    {
        return 'DATE_FORMAT('.self::convertToJSTSql($column).', "%Y-%m")';
    }

    /**
     * JST基準での月範囲フィルタ用のSQL条件を生成
     *
     * @param  string  $column  カラム名
     * @param  string  $month  YYYY-MM形式の月
     * @return array [sql_condition, start_utc, end_utc]
     */
    public static function monthRangeFilterSql(string $column, string $month): array
    {
        // JST基準での月初・月末を計算
        $startJST = Carbon::parse($month.'-01 00:00:00', self::JAPAN_TIMEZONE);
        $endJST = $startJST->copy()->endOfMonth()->setTime(23, 59, 59);

        // UTCに変換
        $startUTC = $startJST->utc()->format('Y-m-d H:i:s');
        $endUTC = $endJST->utc()->format('Y-m-d H:i:s');

        $sql = "{$column} >= ? AND {$column} <= ?";

        return [$sql, $startUTC, $endUTC];
    }
}
