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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->string('nik', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->string('nomor_hp', 25)->nullable();
            $table->string('pendidikan')->nullable();
            $table->text('kegiatan_aktif')->nullable();
            $table->text('karya_tulis')->nullable();
            $table->text('buku_lain')->nullable();
            $table->json('media_sosial')->nullable();
            $table->text('jejaring')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
