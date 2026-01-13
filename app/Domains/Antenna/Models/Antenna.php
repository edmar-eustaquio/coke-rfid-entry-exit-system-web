<?php

namespace App\Domains\Antenna\Models;

use Illuminate\Database\Eloquent\Model;

class Antenna extends Model
{
    protected $fillable = [
        "reader_id",
        "port",
        "station",
        'entry_or_exit_site',
    ];  
}
