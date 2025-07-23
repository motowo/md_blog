<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BankAccount>
 */
class BankAccountFactory extends Factory
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
            'bank_name' => $this->faker->randomElement(['みずほ銀行', '三菱UFJ銀行', '三井住友銀行', 'りそな銀行']),
            'branch_name' => $this->faker->city.'支店',
            'account_type' => $this->faker->randomElement(['普通', '当座']),
            'account_number' => $this->faker->numerify('#######'),
            'account_holder_name' => $this->faker->name(),
            'is_active' => true,
            'verified_at' => null,
        ];
    }
}
