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
        'avatar_path',
        'bio',
        'career_description',
        'x_url',
        'github_url',
        'profile_public',
        'is_active',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['avatar_url'];

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
            'last_login_at' => 'datetime',
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
     * Get the avatar URL attribute.
     * Dynamically returns the URL from active avatar file.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        $activeAvatar = $this->activeAvatar();
        return $activeAvatar ? $activeAvatar->url : null;
    }

    /**
     * Get the credit card for the user.
     */
    public function creditCard(): HasOne
    {
        return $this->hasOne(CreditCard::class);
    }

    /**
     * Get the bank accounts for the user.
     */
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }

    /**
     * Get the active bank account for the user.
     */
    public function activeBankAccount()
    {
        return $this->bankAccounts()->active()->first();
    }

    /**
     * Check if the user has an active bank account.
     */
    public function hasActiveBankAccount(): bool
    {
        return $this->activeBankAccount() !== null;
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
     *
     * @param  int|null  $year  取得対象年（nullの場合は過去1年間）
     */
    public function getArticleActivity(?int $year = null): array
    {
        $query = $this->articles()
            ->selectRaw('
                DATE(created_at) as date, 
                COUNT(*) as total_count,
                SUM(CASE WHEN is_paid = true THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN is_paid = false THEN 1 ELSE 0 END) as free_count
            ');

        if ($year) {
            // 指定年の1月1日から12月31日まで
            $query->whereYear('created_at', $year);
        } else {
            // デフォルト：過去1年間
            $query->where('created_at', '>=', now()->subYear());
        }

        $activities = $query
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($activity) {
                return [
                    $activity->date => [
                        'total' => $activity->total_count,
                        'paid' => $activity->paid_count,
                        'free' => $activity->free_count,
                    ],
                ];
            })
            ->toArray();

        return $activities;
    }
}
