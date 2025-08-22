<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskProgress extends Model
{
    use HasFactory;

    protected $table = 'task_progress';
    protected $primaryKey = 'progres_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'buku_id',
        'tugas_id',
        'pic_tugas_user_id',
        'deadline',
        'status',
        'catatan',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    /**
     * Get the book this task progress belongs to.
     */
    public function book()
    {
        return $this->belongsTo(Book::class, 'buku_id', 'buku_id');
    }

    /**
     * Get the master task this progress is for.
     */
    public function masterTask()
    {
        return $this->belongsTo(MasterTask::class, 'tugas_id', 'tugas_id');
    }

    /**
     * Get the PIC for this task.
     */
    public function pic()
    {
        return $this->belongsTo(User::class, 'pic_tugas_user_id', 'user_id');
    }
}
