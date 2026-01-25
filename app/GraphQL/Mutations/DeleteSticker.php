<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Sticker;

final class DeleteSticker
{
  /**
   * @param  null  $_
   * @param  array{}  $args
   */
  public function __invoke($_, array $args)
  {
    $sticker = Sticker::findOrFail($args['id']);
    $sticker->delete();
    return $sticker;
  }
}
