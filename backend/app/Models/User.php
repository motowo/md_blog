<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'profile_image_url',
        'avatar_path',
        'bio',
        'career_description',
        'x_url',
        'github_url',
        'profile_public',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_public' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the articles for the user.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    /**
     * Get the payments for the user.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the avatar files for the user.
     */
    public function avatarFiles(): HasMany
    {
        return $this->hasMany(AvatarFile::class);
    }

    /**
     * Get the active avatar file for the user.
     */
    public function activeAvatar()
    {
        return $this->avatarFiles()->active()->latest()->first();
    }

    /**
     * Get the credit card for the user.
     */
    public function creditCard(): HasOne
    {
        return $this->hasOne(CreditCard::class);
    }

    /**
     * Check if the user has purchased the given article.
     */
    public function hasPurchased(Article $article): bool
    {
        return $this->payments()
            ->where('article_id', $article->id)
            ->where('status', 'success')
            ->exists();
    }

    /**
     * Get article posting activity for heatmap.
     */
    public function getArticleActivity(): array
    {
        $activities = $this->articles()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subYear())
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        return $activities;
    }
}
