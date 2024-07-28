<?php

namespace Database\Seeders;

use App\Models\Rally;
use App\Models\Singer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class RallySeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    DB::table('rallies')->insertOrIgnore([
      'created_at' => now(),
      'name' => 'LSHB 2024',
      'start_date' => Date::createFromFormat('Y-m-d', "2024-02-29"),
      'stop_date' => Date::createFromFormat('Y-m-d', "2024-03-02"),
      'updated_at' => now()
    ]);
    $rallySeed = Rally::query()->first()->get()->toArray()[0];
    $singers = Singer::all()->toArray();
    foreach ($singers as $singerSeed)
    {
      DB::table('rally_singer')->insert([
        'rally_id' => $rallySeed['id'],
        'singer_id' => $singerSeed['id'],
        'unique_id' => $singerSeed['unique_id']
      ]);
    }
  }
}
