<?php

namespace App\Models;

use App\Models\Singer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sticker extends Model
{
  use HasFactory;

  protected function bothSingersQuery()
  {
    return Singer::where(
      function ($query)
      {
        $query->where("id", $this->sender_id)
          ->orWhere("id", $this->recipient_id);
      }
    );
  }

  public function recipient()
  {
    return $this->hasOne(Singer::class, "id", "recipient_id");
  }

  public function sender()
  {
    return $this->hasOne(Singer::class, "id", "sender_id");
  }

  public function singers()
  {
    return $this->bothSingersQuery()->get();
  }
}
