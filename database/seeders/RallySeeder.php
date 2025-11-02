<?php

namespace Database\Seeders;

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
      'name' => 'LSHB 2025',
      'start_date' => Date::createFromFormat('Y-m-d', "2025-02-27"),
      'stop_date' => Date::createFromFormat('Y-m-d', "2025-03-01"),
      'updated_at' => now()
    ]);
  }
}
