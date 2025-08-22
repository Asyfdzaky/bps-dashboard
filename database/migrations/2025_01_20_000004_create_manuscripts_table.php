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
        Schema::create('manuscripts', function (Blueprint $table) {
            $table->uuid('naskah_id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('penulis_user_id');
            $table->string('judul_naskah');
            $table->text('sinopsis')->nullable();
            $table->string('genre', 100)->nullable();
            $table->timestamp('tanggal_masuk')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->string('status', 50);
            $table->string('file_naskah_url')->nullable();
            $table->json('info_tambahan')->nullable();
            $table->timestamps();

            $table->foreign('penulis_user_id')
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
        Schema::dropIfExists('manuscripts');
    }
};
