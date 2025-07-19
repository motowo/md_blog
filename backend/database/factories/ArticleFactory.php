<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'content' => fake()->paragraphs(3, true),
            'thumbnail_url' => fake()->imageUrl(640, 480, 'business'),
            'status' => fake()->randomElement(['draft', 'published']),
            'is_paid' => fake()->boolean(30),
            'price' => fake()->optional(0.7)->randomFloat(2, 100, 10000),
            'preview_content' => fake()->paragraph(),
            'is_featured' => fake()->boolean(10),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_paid' => true,
            'price' => fake()->randomFloat(2, 500, 5000),
        ]);
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_paid' => false,
            'price' => null,
        ]);
    }
}
