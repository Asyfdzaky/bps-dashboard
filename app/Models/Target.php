<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Target extends Model
{
    use HasFactory;

    protected $table = 'target';
    protected $primaryKey = 'target_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'penerbit_id',
        'tipe_target',
        'kategori',
        'tahun',
        'bulan',
        'jumlah_target',
    ];

    /**
     * Get the publisher this target belongs to.
     */
    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'penerbit_id', 'penerbit_id');
    }
}
