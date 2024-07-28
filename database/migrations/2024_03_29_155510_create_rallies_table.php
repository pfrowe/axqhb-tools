<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRalliesTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('rallies', function (Blueprint $table)
    {
      $table->id();
      $table->string('name', 191)->unique();
      $table->string('image_url', 255);
      $table->date('start_date');
      $table->date('stop_date');
      $table->timestamps();
    });
    Schema::create('rally_singers', function (Blueprint $table)
    {
      $table->id();
      $table->unsignedBigInteger('rally_id');
      $table->unsignedBigInteger('singer_id');
      $table->string('unique_id', 36)->unique();
      $table->timestamps();
    });
    Schema::table('rally_singers', function (Blueprint $table)
    {
      $table->foreign('rally_id')->references('id')->on('rallies')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('singer_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('rally_singers');
    Schema::dropIfExists('rallies');
  }
}
