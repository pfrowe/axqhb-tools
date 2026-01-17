<?php

use App\Models\RallySinger;
use App\Models\Singer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MoveIsGuestSingerToRallySingers extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('rally_singers', function (Blueprint $table)
    {
      $table->boolean('is_guest_singer')->default(false)->after('voice_part');
    });
    $singers = Singer::all()->toArray();
    foreach ($singers as $singerSeed)
    {
      $isGuestSinger = $singerSeed['is_guest_singer'];
      RallySinger::query()
        ->where('singer_id', $singerSeed['id'])
        ->update(['is_guest_singer' => $isGuestSinger]);
    }
    Schema::table('singers', function (Blueprint $table)
    {
      $table->dropColumn('is_guest_singer');
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
      $table->boolean('is_guest_singer')->default(false)->after('voice_part');
    });
    $rallySingers = RallySinger::all()->toArray();
    foreach ($rallySingers as $rallySingerSeed)
    {
      $isGuestSinger = $rallySingerSeed['is_guest_singer'];
      Singer::query()
        ->where('id', $rallySingerSeed['singer_id'])
        ->update(['is_guest_singer' => $isGuestSinger]);
    }
    Schema::table('rally_singers', function (Blueprint $table)
    {
      $table->dropColumn('is_guest_singer');
    });
  }
}
