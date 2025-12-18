<?php

namespace App\Domains\Reader\Models;

use Illuminate\Database\Eloquent\Model;

class Reader extends Model
{
    protected $fillable = [
        'serial_no',
        'arduino_id',
        'location',
        'location_code',
    ];
}
