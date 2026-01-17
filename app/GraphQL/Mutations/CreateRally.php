<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Rally;

final class CreateRally
{
  /**
   * @param null $_
   * @param array{} $args
   */
  public function __invoke($_, array $args)
  {
    $rally = new Rally();
    $rally->fill($args);
    $rally->save();
    return $rally;
  }
}
