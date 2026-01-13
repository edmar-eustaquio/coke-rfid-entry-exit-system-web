<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('truck_id')
                ->constrained('trucks')
                ->onDelete("CASCADE");
            $table->date('date_scan');
            $table->time('time_scan');
            $table->date('out_date_scan')->nullable();
            $table->time('out_time_scan')->nullable();
            $table->string('type');
            $table->string('location_code');
            $table->string('location');
            $table->string('station');
            $table->string('current_station')->nullable();
            $table->string('entry_or_exit_site')->nullable();
            $table->string('entry_error')->nullable();
            $table->string('exit_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('histories');
    }
};
