<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
      $table->dropForeign('stickers_recipient_id_foreign');
      $table->dropForeign('stickers_sender_id_foreign');
    });
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->dropColumn('recipient_id');
      $table->dropColumn('sender_id');
    });
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->unsignedBigInteger('recipient_id');
      $table->unsignedBigInteger('sender_id');
    });
    DB::statement("
    UPDATE `stickers`
    INNER JOIN `rally_singers` AS `recipient` ON (`stickers`.`recipient_uid` = `recipient`.`unique_id`)
    INNER JOIN `rally_singers` AS `sender` ON (`stickers`.`sender_uid` = `sender`.`unique_id`)
    SET
      `stickers`.`recipient_id` = `recipient`.`id`,
      `stickers`.`sender_id` = `sender`.`id`
    ");
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->foreign('recipient_id')->references('id')->on('rally_singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('rally_singers')->onDelete('cascade')->onUpdate('cascade');
      $table->dropColumn('recipient_uid');
      $table->dropColumn('sender_uid');
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
      $table->string('recipient_uid', 255);
      $table->string('sender_uid', 255);
    });
    DB::statement("
      UPDATE `stickers`
      INNER JOIN `rally_singers` AS `recipient` ON (`stickers`.`recipient_id` = `recipient`.`id`)
      INNER JOIN `rally_singers` AS `sender` ON (`stickers`.`sender_id` = `sender`.`id`)
      SET
        `stickers`.`recipient_uid` = `recipient`.`unique_id`,
        `stickers`.`sender_uid` = `sender`.`unique_id`
    ");
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->dropForeign('stickers_recipient_id_foreign');
      $table->dropForeign('stickers_sender_id_foreign');
    });
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->dropColumn('recipient_id');
      $table->dropColumn('sender_id');
    });
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->unsignedBigInteger('recipient_id');
      $table->unsignedBigInteger('sender_id');
    });
    DB::statement("
      UPDATE `stickers`
      INNER JOIN `rally_singers` AS `recipient` ON (`stickers`.`recipient_uid` = `recipient`.`unique_id`)
      INNER JOIN `rally_singers` AS `sender` ON (`stickers`.`sender_uid` = `sender`.`unique_id`)
      SET
        `stickers`.`recipient_id` = `recipient`.`singer_id`,
        `stickers`.`sender_id` = `sender`.`singer_id`
    ");
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->foreign('recipient_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
    });
  }
}
