<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterTask extends Model
{
    use HasFactory;

    protected $table = 'master_tasks';
    protected $primaryKey = 'tugas_id';

    protected $fillable = [
        'nama_tugas',
        'urutan',
    ];

    /**
     * Get the task progress for this master task.
     */
    public function taskProgress()
    {
        return $this->hasMany(TaskProgress::class, 'tugas_id', 'tugas_id');
    }
}
