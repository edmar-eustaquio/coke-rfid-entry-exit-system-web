<?php

namespace App\Infrastracture\ThirdParty\PowerBI;

use Illuminate\Support\Facades\Http;

class PowerBIService
{
    public static function sendData(array $data): void
    {
        try{
            $powerBILink = env('POWER_BI_POST_URL');
            if (!$powerBILink) return;
            
             Http::post($powerBILink, $data);
        } catch(\Exception $e){
            info($e->getMessage());
        }
    }
}