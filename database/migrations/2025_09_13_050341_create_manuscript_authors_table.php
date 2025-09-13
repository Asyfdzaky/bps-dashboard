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
        Schema::create('manuscript_authors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('naskah_id');
            $table->uuid('author_id');
            $table->enum('role', ['primary', 'co_author'])->default('primary');
            $table->integer('order_position')->default(1);
            $table->timestamps();

            $table->foreign('naskah_id')
                ->references('naskah_id')
                ->on('manuscripts')
                ->onDelete('cascade');

            $table->foreign('author_id')
                ->references('author_id')
                ->on('authors')
                ->onDelete('cascade');

            $table->unique(['naskah_id', 'author_id']);
            $table->index(['naskah_id', 'order_position']);
            $table->index(['author_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manuscript_authors');
    }
};
