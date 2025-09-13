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
        Schema::create('authors', function (Blueprint $table) {
            $table->uuid('author_id')->primary();
            $table->uuid('user_id')->nullable(); // FK ke users, nullable untuk external authors
            $table->string('nama_lengkap');
            $table->string('email')->nullable();
            $table->string('nik', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->string('nomor_hp', 25)->nullable();
            $table->string('pendidikan')->nullable();
            $table->text('kegiatan_aktif')->nullable();
            $table->text('karya_tulis')->nullable(); // karya tulis di media online/cetak
            $table->text('buku_lain')->nullable(); // buku lain yang pernah ditulis
            $table->json('media_sosial')->nullable();
            $table->text('jejaring')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('set null');

            $table->index('user_id');
            $table->index(['nama_lengkap', 'email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authors');
    }
};
