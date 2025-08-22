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
        Schema::create('task_progress', function (Blueprint $table) {
            $table->uuid('progres_id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('buku_id');
            $table->unsignedBigInteger('tugas_id');
            $table->uuid('pic_tugas_user_id')->nullable();
            $table->date('deadline')->nullable();
            $table->string('status', 50)->default('Belum Mulai');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(['buku_id', 'tugas_id']);

            $table->foreign('buku_id')
                  ->references('buku_id')
                  ->on('books')
                  ->onDelete('cascade');

            $table->foreign('tugas_id')
                  ->references('tugas_id')
                  ->on('master_tasks')
                  ->onDelete('cascade');

            $table->foreign('pic_tugas_user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_progress');
    }
};
