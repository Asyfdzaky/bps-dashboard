<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('target', function (Blueprint $table) {
            $table->uuid('target_id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->unsignedBigInteger('penerbit_id');
            $table->string('tipe_target', 50);
            $table->integer('tahun');
            $table->integer('bulan');
            $table->integer('jumlah_target');
            $table->timestamps();

            $table->foreign('penerbit_id')
                  ->references('penerbit_id')
                  ->on('publishers')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('target');
    }
};
