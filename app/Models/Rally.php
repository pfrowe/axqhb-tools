<?php

namespace App\Models;

use App\Models\RallySinger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rally extends Model
{
  use HasFactory;
  protected $fillable = [
    "name",
    "start_date",
    "stop_date"
  ];

  public function singers()
  {
    return $this->hasMany(RallySinger::class, "rally_id", "id");
  }
}
