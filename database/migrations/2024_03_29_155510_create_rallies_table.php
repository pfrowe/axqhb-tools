<?php

use App\Models\Rally;
use App\Models\Singer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
    $rallySeeder = new \Database\Seeders\RallySeeder();
    $rallySeeder->run();
    Schema::create('rally_singers', function (Blueprint $table)
    {
      $table->id();
      $table->unsignedBigInteger('rally_id');
      $table->unsignedBigInteger('singer_id');
      $table->string('voice_part')->default('guest');
      $table->string('unique_id', 36)->unique();
      $table->timestamps();
    });
    Schema::table('rally_singers', function (Blueprint $table)
    {
      $table->foreign('rally_id')->references('id')->on('rallies')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('singer_id')->references('id')->on('singers')->onDelete('cascade')->onUpdate('cascade');
    });
    $rallySeed = Rally::query()->first()->get()->toArray()[0];
    $singers = Singer::all()->toArray();
    foreach ($singers as $singerSeed)
    {
      DB::table('rally_singers')->insert([
        'rally_id' => $rallySeed['id'],
        'singer_id' => $singerSeed['id'],
        'unique_id' => $singerSeed['unique_id'],
        'voice_part' => $singerSeed['voice_part']
      ]);
    }
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
