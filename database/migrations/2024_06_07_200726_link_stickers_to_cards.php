<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class LinkStickersToCards extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->dropForeign('recipient_id');
      $table->dropForeign('sender_id');
      $table->foreign('recipient_id')->references('id')->on('rally_singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('rally_singers')->onDelete('cascade')->onUpdate('cascade');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->dropForeign('recipient_id');
      $table->dropForeign('sender_id');
      $table->foreign('recipient_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
    });
  }
}
