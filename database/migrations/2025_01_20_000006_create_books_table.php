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
        Schema::create('books', function (Blueprint $table) {
            $table->uuid('buku_id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('naskah_id')->unique();
            $table->string('judul_buku');
            $table->uuid('pic_user_id');
            $table->unsignedBigInteger('penerbit_id');
            $table->string('status_keseluruhan', 50)->default('Belum Mulai');
            $table->date('tanggal_target_naik_cetak');
            $table->date('tanggal_realisasi_naik_cetak')->nullable();
            $table->timestamps();

            $table->foreign('naskah_id')
                  ->references('naskah_id')
                  ->on('manuscripts')
                  ->onDelete('cascade');

            $table->foreign('pic_user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');

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
        Schema::dropIfExists('books');
    }
};
