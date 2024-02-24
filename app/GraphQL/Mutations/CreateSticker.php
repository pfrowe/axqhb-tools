<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Sticker;

final class CreateSticker
{
  /**
   * @param  null  $_
   * @param  array{}  $args
   */
  public function __invoke($_, array $args)
  {
    $sticker = new Sticker();
    $sticker->fill($args);
    $sticker->save();
    return $sticker;
  }
}
