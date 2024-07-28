<?php

namespace App\Models;

use App\Models\RallySinger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sticker extends Model
{
  use HasFactory;

  protected $fillable = [
    "recipient_id",
    "sender_id",
    "status"
  ];

  protected function bothSingersQuery()
  {
    return RallySinger::where(
      function ($query)
      {
        $query->where("id", $this->sender_id)
          ->orWhere("id", $this->recipient_id);
      }
    );
  }

  public function recipient()
  {
    return $this->hasOne(RallySinger::class, "id", "recipient_id");
  }

  public function sender()
  {
    return $this->hasOne(RallySinger::class, "id", "sender_id");
  }

  public function singers()
  {
    return $this->bothSingersQuery()->get();
  }
}
