<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManuscriptTargetPublisher extends Model
{
    use HasFactory;

    protected $table = 'manuscript_target_publishers';
    protected $primaryKey = ['naskah_id', 'penerbit_id'];
    public $incrementing = false;

    protected $fillable = [
        'naskah_id',
        'penerbit_id',
        'prioritas',
    ];

    /**
     * Get the manuscript.
     */
    public function manuscript()
    {
        return $this->belongsTo(Manuscript::class, 'naskah_id', 'naskah_id');
    }

    /**
     * Get the publisher.
     */
    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'penerbit_id', 'penerbit_id');
    }
}
