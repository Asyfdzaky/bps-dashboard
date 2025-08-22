<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'nik',
        'alamat',
        'nomor_hp',
        'pendidikan',
        'kegiatan_aktif',
        'karya_tulis',
        'buku_lain',
        'media_sosial',
        'jejaring',
    ];

    protected $casts = [
        'media_sosial' => 'array',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
