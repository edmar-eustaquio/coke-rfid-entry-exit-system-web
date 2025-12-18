<?php

namespace App\Domains\Truck\Models;

use Illuminate\Database\Eloquent\Model;
use \App\Domains\ScanHistory\Models\History;

class Truck extends Model
{
    protected $fillable =[
        'rfid',
        'vehicle_id',
        'plate_no',
        'capacity',
        'agent',
        'location_code',
        'location',
        'provider',
    ];

    public function histories(){
        return $this->hasMany(History::class, 'truck_id');
    }
    
    public function latestHistory()
    {
        return $this->hasOne(History::class, 'truck_id')
                    ->orderBy('date_scan', 'desc')
                    ->orderBy('time_scan', 'desc')
                    ->latestOfMany();
    }


}
