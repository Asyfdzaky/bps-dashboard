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
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['proses', 'selesai', 'mendekati-deadline'])->default('proses');


            $table->string('pic_name')->nullable();

            $table->boolean('all_day')->default(true);

            // Foreign key ke master_tasks
            $table->uuid('pic_user_id')->nullable(); // Foreign key ke users untuk PIC

            // User tracking fields
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();


            $table->foreign('pic_user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('user_id')->on('users')->onDelete('set null');

            // Indexes for better performance
            $table->index(['status']);
            $table->index(['start_date']);
            $table->index(['end_date']);
            $table->index(['pic_user_id']);
            $table->index(['created_by']);
            $table->index(['updated_by']);
            $table->index(['pic_name']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
