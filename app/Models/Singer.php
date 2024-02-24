<?php

namespace App\Models;

use App\Models\Sticker;
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
    "street_line_1",
    "street_line_2",
    "unique_id",
    "user_id",
    "user",
    "voice_part"
  ];

  public function stickers_received()
  {
    return $this->hasMany(Sticker::class, "recipient_id", "id");
  }

  public function stickers_sent()
  {
    return $this->hasMany(Sticker::class, "sender_id", "id");
  }
}
