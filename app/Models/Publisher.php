<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    use HasFactory;

    protected $primaryKey = 'penerbit_id';

    protected $fillable = [
        'nama_penerbit',
        'deskripsi_segmen',
    ];

    /**
     * Get the books published by this publisher.
     */
    public function books()
    {
        return $this->hasMany(Book::class, 'penerbit_id', 'penerbit_id');
    }

    /**
     * Get the manuscripts targeted to this publisher.
     */
    public function manuscriptTargets()
    {
        return $this->hasMany(ManuscriptTargetPublisher::class, 'penerbit_id', 'penerbit_id');
    }

    /**
     * Get the targets for this publisher.
     */
    public function targets()
    {
        return $this->hasMany(Target::class, 'penerbit_id', 'penerbit_id');
    }
}
