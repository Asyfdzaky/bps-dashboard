<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $primaryKey = 'buku_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'naskah_id',
        'judul_buku',
        'pic_user_id',
        'penerbit_id',
        'status_keseluruhan',
        'tanggal_target_naik_cetak',
        'tanggal_realisasi_naik_cetak',
    ];

    protected $casts = [
        'tanggal_target_naik_cetak' => 'date',
        'tanggal_realisasi_naik_cetak' => 'date',
    ];

    /**
     * Get the manuscript this book is based on.
     */
    public function manuscript()
    {
        return $this->belongsTo(Manuscript::class, 'naskah_id', 'naskah_id');
    }

    /**
     * Get the PIC for this book.
     */
    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_user_id', 'user_id');
    }

    /**
     * Get the publisher of this book.
     */
    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'penerbit_id', 'penerbit_id');
    }

    /**
     * Get the task progress for this book.
     */
    public function taskProgress()
    {
        return $this->hasMany(TaskProgress::class, 'buku_id', 'buku_id');
    }
}
