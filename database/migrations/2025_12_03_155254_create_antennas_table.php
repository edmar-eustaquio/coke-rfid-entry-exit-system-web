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
        Schema::create('antennas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reader_id')
                ->constrained("readers")
                ->onDelete("CASCADE");
            $table->integer('port');
            $table->string('station');
            $table->string('entry_or_exit_site')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antennas');
    }
};
