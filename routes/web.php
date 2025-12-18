<?php

use App\Http\Controllers\AntennaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\TruckController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;



Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/get', [DashboardController::class, 'get'])->name('dashboard.get');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    
    Route::get('', [UserController::class, 'index'])->name('user.index');

    Route::controller(UserController::class)->prefix('user')->name('user.')->group(function(){
        // Route::get('/', 'index')->name('index');

        Route::get('/all', 'all')->name('all');
        Route::post('/create', 'create')->name('create');
        Route::put('/update/{id}', 'update')->name('update');
        Route::patch('/update-password/{id}', 'updatePassword')->name('update-password');
        Route::delete('/delete/{id}', 'delete')->name('delete');
    });

    Route::controller(ReaderController::class)->prefix('reader')->name('reader.')->group(function(){
        Route::controller(AntennaController::class)->prefix('antenna')->name('antenna.')->group(function(){
            Route::get('/index/{reader_id}', 'index')->name('index');
            Route::get('/get-by-reader/{reader_id}', 'getByReader')->name('get-by-reader');
            Route::post('/create', 'create')->name('create');
            Route::put('/update/{id}', 'update')->name('update');
            Route::delete('/delete/{id}', 'delete')->name('delete');
        });

        Route::get('/', 'index')->name('index');
        Route::get('/all', 'all')->name('all');
        Route::post('/create', 'create')->name('create');
        Route::put('/update/{id}', 'update')->name('update');
        Route::delete('/delete/{id}', 'delete')->name('delete');

    });


    Route::controller(TruckController::class)->prefix('truck')->name('truck.')->group(function(){
        Route::get('/', 'index')->name('index');

        Route::get('/export', 'export')->name('export');
        
        Route::get('/all', 'all')->name('all');
        Route::post('/upload', 'upload')->name('upload');
        Route::put('/update/{id}', 'update')->name('update');
        Route::delete('/delete/{id}', 'delete')->name('delete');
    });

    Route::controller(HistoryController::class)->prefix('history')->name('history.')->group(function(){
        Route::get('/', 'index')->name('index');

        Route::get('/export', 'export')->name('export');
        
        Route::get('/all', 'all')->name('all');
        Route::post('/create', 'create');
        Route::put('/update/{id}', 'update');
        Route::delete('/delete/{id}', 'delete');
        Route::post('/test', 'test');
    });
});

require __DIR__.'/auth.php';
