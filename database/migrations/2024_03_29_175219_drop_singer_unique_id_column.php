<?php

use App\Models\Singer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DropSingerUniqueIdColumn extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    DB::statement("CREATE TABLE `singers_backup` LIKE `singers`");
    DB::statement("INSERT INTO `singers_backup` SELECT * FROM `singers`");
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->string('recipient_uid', 255);
      $table->string('sender_uid', 255);
    });
    DB::statement("
      UPDATE `stickers`
      INNER JOIN `singers` ON (`stickers`.`recipient_id` = `singers`.`id`)
      SET `stickers`.`recipient_uid` = `singers`.`unique_id`
    ");
    DB::statement("
      UPDATE `stickers`
      INNER JOIN `singers` ON (`stickers`.`sender_id` = `singers`.`id`)
      SET `stickers`.`sender_uid` = `singers`.`unique_id`
    ");
    Schema::table('singers', function (Blueprint $table)
    {
      $table->dropUnique(['unique_id']);
      $table->dropColumn('unique_id');
      $table->dropColumn('voice_part');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('singers', function (Blueprint $table)
    {
      $table->string('unique_id', 36);
      $table->string('voice_part')->default('guest');
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
    INNER JOIN `singers` ON (`stickers`.`recipient_uid` = `singers`.`unique_id`)
    SET `stickers`.`recipient_id` = `singers`.`id`
    ");
    DB::statement("
    UPDATE `stickers`
    INNER JOIN `singers` ON (`stickers`.`sender_uid` = `singers`.`unique_id`)
    SET `stickers`.`sender_id` = `singers`.`id`
    ");
    Schema::table('stickers', function (Blueprint $table)
    {
      $table->foreign('recipient_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('sender_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
      $table->dropColumn('recipient_uid');
      $table->dropColumn('sender_uid');
    });
    Schema::table('singers', function (Blueprint $table)
    {
      $danceCards = DB::table('rally_singers')->get();
      foreach ($danceCards as $danceCard)
      {
        Singer::query()
          ->where('id', '=', $danceCard->singer_id)
          ->update(['unique_id' => $danceCard->unique_id, 'voice_part' => $danceCard->voice_part]);
      }
      $table->unique('unique_id');
    });
    Schema::dropIfExists("singers_backup");
  }
}
