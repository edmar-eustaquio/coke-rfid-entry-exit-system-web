<?php

use App\Http\Controllers\HistoryController;
use App\Http\Controllers\TruckController;
use App\Http\Middleware\ApiKeyMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(ApiKeyMiddleware::class)->group(function () {
    Route::post('/history/store-from-android-reader/{location}/{code}/{station}/{type}', [HistoryController::class, 'storeFromAndroidReader']);
    Route::post('/history/store-from-reader/{location}/{code}/{station}', [HistoryController::class, 'storeFromReader']);
    Route::post('truck/create', [TruckController::class, 'create'])->name('truck.create');
    Route::get('/history/status/{location}/{code}/{station}', [HistoryController::class, 'getStatus']);

    
    Route::get('/history/status-by-id/{arduinoId}', [HistoryController::class, 'getStatusById']);
    Route::post('/history/store-from-reader-serial/{serial}', [HistoryController::class, 'storeFromReaderBySerial']);
});