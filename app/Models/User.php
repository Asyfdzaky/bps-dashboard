<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
    use HasUuids;
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use Notifiable;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_lengkap',
        'email',
        'password',
        'foto_profil_url',
        'penerbit_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
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
            'penerbit_id' => 'integer',
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id', 'user_id');
    }

    /**
     * Get the manuscripts written by this user.
     */
    public function manuscripts()
    {
        return $this->hasMany(Manuscript::class, 'penulis_user_id', 'user_id');
    }

    /**
     * Get the books where this user is the PIC.
     */
    public function booksAsPic()
    {
        return $this->hasMany(Book::class, 'pic_user_id', 'user_id');
    }

    /**
     * Get the task progress where this user is the PIC.
     */
    public function taskProgressAsPic()
    {
        return $this->hasMany(TaskProgress::class, 'pic_tugas_user_id', 'user_id');
    }
    /**
     * Get the publisher this user manages
     */
    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'penerbit_id', 'penerbit_id');
    }

    /**
     * Check if user has publisher role
     */
    public function hasPublisherRole()
    {
        return $this->hasRole('penerbit');
    }

    /**
     * Get the publisher this user manages
     */
    public function getPublisher()
    {
        return $this->publisher;
    }

    /**
     * Get the publisher ID this user manages
     */
    public function getPublisherId()
    {
        return $this->penerbit_id;
    }
}
