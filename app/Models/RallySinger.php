<?php

namespace App\Models;

use App\Models\Rally;
use App\Models\Singer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RallySinger extends Model
{
  use HasFactory;
  protected $table = "rally_singers";
  protected $fillable = [
    "rally_id",
    "singer_id",
    "is_guest_singer",
    "voice_part",
    "unique_id"
  ];

  public function rally()
  {
    return $this->belongsTo(Rally::class, "rally_id", "id");
  }

  public function singer()
  {
    return $this->belongsTo(Singer::class, "singer_id", "id");
  }

  public function stickers_received()
  {
    return $this->hasMany(Sticker::class, "recipient_id", "id");
  }

  public function stickers_sent()
  {
    return $this->hasMany(Sticker::class, "sender_id", "id");
  }
}
