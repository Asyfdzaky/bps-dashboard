<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Calendar extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'calendar_events';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
        'pic_name',
        'all_day',
        'pic_user_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'all_day' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];



    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'user_id');
    }

    public function picUser()
    {
        return $this->belongsTo(User::class, 'pic_user_id', 'user_id');
    }
}
