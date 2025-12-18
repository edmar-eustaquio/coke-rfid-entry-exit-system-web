<?php

namespace App\Domains\ScanHistory\Models;

use App\Domains\Truck\Models\Truck;
use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $fillable = [
        'truck_id',
        'date_scan',
        'time_scan',
        'type', //optional
        'location_code',
        'location',
        'station',
        
        'out_date_scan',
        'out_time_scan',
        'current_station',
    ];

    public function truck(){
        return $this->belongsTo(Truck::class, 'truck_id');
    }
}
