<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manuscript extends Model
{
    use HasFactory;

    protected $primaryKey = 'naskah_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'naskah_id',
        'penulis_user_id',
        'judul_naskah',
        'sinopsis',
        'genre',
        'tanggal_masuk',
        'status',
        'file_naskah_url',
        'info_tambahan',
    ];

    protected $casts = [
        'tanggal_masuk' => 'datetime',
        'info_tambahan' => 'array',
    ];

    /**
     * Get the author of the manuscript.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'penulis_user_id', 'user_id');
    }

    /**
     * Get the target publishers for this manuscript.
     */
    public function targetPublishers()
    {
        return $this->hasMany(ManuscriptTargetPublisher::class, 'naskah_id', 'naskah_id');
    }

    /**
     * Get the book created from this manuscript.
     */
    public function book()
    {
        return $this->hasOne(Book::class, 'naskah_id', 'naskah_id');
    }
    public function authors()
    {
        return $this->belongsToMany(Author::class, 'manuscript_authors', 'naskah_id', 'author_id')
            ->withPivot('role', 'order_position')
            ->withTimestamps()
            ->orderBy('manuscript_authors.order_position');
    }

    public function primaryAuthor()
    {
        return $this->authors()->wherePivot('role', 'primary')->first();
    }

    public function coAuthors()
    {
        return $this->authors()->wherePivot('role', 'co_author')->get();
    }
}
