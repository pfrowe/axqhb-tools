<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\RallySinger;

final class UpdateRallySinger
{
  /**
   * @param null $_
   * @param array{} $args
   */
  public function __invoke($_, array $args)
  {
    $input = $args['input'] ?? $args;
    $rallySinger = RallySinger::findOrFail($args['id']);
    $rallySinger->fill($input);
    $rallySinger->save();
    return $rallySinger;
  }
}
