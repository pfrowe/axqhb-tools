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
    Schema::create('stickers', function (Blueprint $table)
    {
      $table->id();
      $table->unsignedBigInteger('recipient_id');
      $table->unsignedBigInteger('sender_id');
      $table->string('status')->default('pending');
      $table->foreign('recipient_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('stickers');
  }
};
