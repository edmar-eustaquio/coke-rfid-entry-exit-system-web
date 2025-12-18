<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Domains\Truck\Repositories\TruckRepository::class,
            \App\Domains\Truck\RepositoriesImplementations\EloquentTruckRepository::class
        );
        $this->app->bind(
            \App\Domains\Reader\Repositories\ReaderRepository::class,
            \App\Domains\Reader\RepositoriesImplementations\EloquentReaderRepository::class
        );
        $this->app->bind(
            \App\Domains\Antenna\Repositories\AntennaRepository::class,
            \App\Domains\Antenna\RepositoriesImplementations\EloquentAntennaRepository::class
        );
        $this->app->bind(
            \App\Domains\ScanHistory\Repositories\HistoryRepository::class,
            \App\Domains\ScanHistory\RepositoriesImplementations\EloquentHistoryRepository::class
        );
        $this->app->bind(
            \App\Domains\User\Repositories\UserRepository::class,
            \App\Domains\User\RepositoriesImplementations\EloquentUserRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
