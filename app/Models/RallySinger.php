<?php

namespace App\Models;

use App\Models\Rally;
use App\Models\Singer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RallySinger extends Model
{
  use HasFactory;

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
