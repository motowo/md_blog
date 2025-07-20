<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'JavaScript', 'slug' => 'javascript'],
            ['name' => 'TypeScript', 'slug' => 'typescript'],
            ['name' => 'React', 'slug' => 'react'],
            ['name' => 'Vue.js', 'slug' => 'vuejs'],
            ['name' => 'Next.js', 'slug' => 'nextjs'],
            ['name' => 'PHP', 'slug' => 'php'],
            ['name' => 'Laravel', 'slug' => 'laravel'],
            ['name' => 'Python', 'slug' => 'python'],
            ['name' => 'Django', 'slug' => 'django'],
            ['name' => 'Go', 'slug' => 'go'],
            ['name' => 'Docker', 'slug' => 'docker'],
            ['name' => 'AWS', 'slug' => 'aws'],
            ['name' => 'MySQL', 'slug' => 'mysql'],
            ['name' => 'Node.js', 'slug' => 'nodejs'],
            ['name' => 'API設計', 'slug' => 'api-design'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['slug' => $tag['slug']], $tag);
        }
    }
}
