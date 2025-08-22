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
        Schema::create('manuscript_target_publishers', function (Blueprint $table) {
            $table->uuid('naskah_id');
            $table->unsignedBigInteger('penerbit_id');
            $table->integer('prioritas');
            $table->timestamps();

            $table->primary(['naskah_id', 'penerbit_id']);

            $table->foreign('naskah_id')
                  ->references('naskah_id')
                  ->on('manuscripts')
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
        Schema::dropIfExists('manuscript_target_publishers');
    }
};
