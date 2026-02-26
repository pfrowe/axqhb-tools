<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Singer;

final class UpdateSinger
{
  /**
   * @param null $_
   * @param array{} $args
   */
  public function __invoke($_, array $args)
  {
    $input = $args['input'] ?? $args;
    $singer = Singer::findOrFail($args['id']);
    $singer->fill($input);
    $singer->save();
    return $singer;
  }
}
