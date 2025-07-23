<?php

namespace App\Http\Resources;

use App\Helpers\TimeZoneHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
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
            'article_id' => $this->article_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'paid_at' => TimeZoneHelper::toJST($this->paid_at),
            'created_at' => TimeZoneHelper::toJST($this->created_at),
            'article_title' => $this->article_title,
            'article_price' => $this->article_price,
            'commission_rate' => $this->commission_rate ?? null,
            'commission_amount' => $this->commission_amount ?? null,
            'net_amount' => $this->net_amount ?? null,
            'user' => $this->whenLoaded('user'),
            'article' => $this->whenLoaded('article'),
        ];
    }
}
