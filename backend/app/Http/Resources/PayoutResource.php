<?php

namespace App\Http\Resources;

use App\Helpers\TimeZoneHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'period' => $this->period,
            'amount' => $this->amount,
            'gross_amount' => $this->gross_amount,
            'commission_amount' => $this->commission_amount,
            'commission_rate' => $this->commission_rate,
            'status' => $this->status,
            'paid_at' => TimeZoneHelper::toJST($this->paid_at),
            'bank_account_info' => $this->bank_account_info,
            'created_at' => TimeZoneHelper::toJST($this->created_at),
            'updated_at' => TimeZoneHelper::toJST($this->updated_at),
        ];
    }
}
