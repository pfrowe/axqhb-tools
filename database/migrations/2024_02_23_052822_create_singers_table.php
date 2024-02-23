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
    Schema::create('singers', function (Blueprint $table)
    {
      $table->id();
      $table->string('unique_id', 36)->unique();
      $table->unsignedInteger('user_id')->nullable();
      $table->string('given_name');
      $table->string('family_name');
      $table->string('email')->unique();
      $table->string('phone');
      $table->string('voice_part')->default('guest');
      $table->boolean('can_receive_texts')->default(true);
      $table->string('image', 255)->nullable();
      $table->string('street_line_1', 255)->nullable();
      $table->string('street_line_2', 255)->nullable();
      $table->string('city', 255)->nullable();
      $table->string('geo_division_1', 255)->nullable();
      $table->string('postal_code')->nullable();
      $table->string('country')->default('US')->nullable();
      $table->foreign('user_id')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('singers');
  }
};
