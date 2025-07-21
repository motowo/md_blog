<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['success', 'failed', 'pending']);
        $paidAt = $status === 'success' ? $this->faker->dateTimeBetween('-1 year', 'now') : null;

        return [
            'user_id' => User::factory(),
            'article_id' => Article::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'status' => $status,
            'transaction_id' => 'MOCK_'.Str::upper(Str::random(16)),
            'paid_at' => $paidAt,
        ];
    }

    /**
     * Indicate that the payment is successful.
     */
    public function success(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'paid_at' => now(),
        ]);
    }

    /**
     * Indicate that the payment failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'paid_at' => null,
        ]);
    }
}
