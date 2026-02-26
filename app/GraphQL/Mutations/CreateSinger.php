<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Singer;

final class CreateSinger
{
  /**
   * @param null $_
   * @param array{} $args
   */
  public function __invoke($_, array $args)
  {
    $input = $args['input'] ?? $args;
    if (!isset($input['can_receive_texts']))
    {
      $input['can_receive_texts'] = false;
    }

    $singer = new Singer();
    $singer->fill($input);
    $singer->save();
    return $singer;
  }
}
