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
    Schema::table('singers', function (Blueprint $table)
    {
      $table->dropUnique(['unique_id']);
      $table->dropColumn('unique_id');
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
      $table->string('unique_id', 36)->unique();
      $danceCards = DB::table('rally_singers')->get();
      foreach ($danceCards as $danceCard)
      {
        Singer::query()->where('id', '=', $danceCard->singer_id)->update(['unique_id' => $danceCard->unique_id]);
      }
    });
    Schema::dropIfExists("singers_backup");
  }
}
