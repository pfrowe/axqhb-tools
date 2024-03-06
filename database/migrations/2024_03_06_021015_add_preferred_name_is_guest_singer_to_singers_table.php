<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPreferredNameIsGuestSingerToSingersTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('singers', function (Blueprint $table)
    {
      $table->boolean('is_guest_singer')->after('voice_part')->default(false);
      $table->string('preferred_name')->after('given_name')->nullable();
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
      $table->dropColumn('is_guest_singer');
      $table->dropColumn('preferred_name');
    });
  }
}
