<?php

namespace App\Models;

use App\Models\RallySinger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Singer extends Model
{
  use HasFactory;

  protected $fillable = [
    "can_receive_texts",
    "city",
    "country",
    "email",
    "family_name",
    "geo_division_1",
    "given_name",
    "image",
    "phone",
    "postal_code",
    "preferred_name",
    "street_line_1",
    "street_line_2",
    "user_id",
    "user"
  ];

  public function rallies()
  {
    return $this->hasMany(RallySinger::class, "singer_id", "id");
  }
}
