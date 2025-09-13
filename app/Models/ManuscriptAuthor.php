<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ManuscriptAuthor extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'naskah_id',
        'author_id',
        'role',
        'order_position',
    ];

    public function manuscript()
    {
        return $this->belongsTo(Manuscript::class, 'naskah_id', 'naskah_id');
    }

    public function author()
    {
        return $this->belongsTo(Author::class, 'author_id', 'author_id');
    }
}
