<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payout>
 */
class PayoutFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'period' => $this->faker->date('Y-m'),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'gross_amount' => $this->faker->randomFloat(2, 110, 11000),
            'commission_amount' => $this->faker->randomFloat(2, 10, 1000),
            'commission_rate' => $this->faker->randomFloat(2, 5, 20),
            'status' => $this->faker->randomElement(['unpaid', 'paid', 'failed']),
            'paid_at' => $this->faker->optional()->dateTime(),
            'bank_account_info' => null,
        ];
    }
}
