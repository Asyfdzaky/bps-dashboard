<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Author extends Model
{
    use HasUuids;

    protected $primaryKey = 'author_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'author_id',
        'user_id',
        'nama_lengkap',
        'email',
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function manuscripts()
    {
        return $this->belongsToMany(Manuscript::class, 'manuscript_authors', 'author_id', 'naskah_id')
            ->withPivot('role', 'order_position')
            ->withTimestamps()
            ->orderBy('manuscript_authors.order_position');
    }

    public function primaryManuscripts()
    {
        return $this->manuscripts()->wherePivot('role', 'primary');
    }

    public function coAuthorManuscripts()
    {
        return $this->manuscripts()->wherePivot('role', 'co_author');
    }
}
