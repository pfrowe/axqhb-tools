<?php

namespace App\Models;

use App\Models\Sticker;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Singer extends Model
{
  use HasFactory;

  public function stickers_received()
  {
    return $this->hasMany(Sticker::class, "recipient_id", "id");
  }

  public function stickers_sent()
  {
    return $this->hasMany(Sticker::class, "sender_id", "id");
  }
}
