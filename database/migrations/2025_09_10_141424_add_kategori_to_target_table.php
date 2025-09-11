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
        Schema::table('target', function (Blueprint $table) {
            $table->enum('kategori', ['target_terbit', 'target_akuisisi'])->default('target_terbit')->after('tipe_target');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('target', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};