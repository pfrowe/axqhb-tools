<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\RallySinger;
use Illuminate\Support\Str;

final class CreateRallySinger
{
  /**
   * @param null $_
   * @param array{} $args
   */
  public function __invoke($_, array $args)
  {
    $input = $args['input'];
    $input['unique_id'] = Str::uuid()->toString();

    $rallySinger = new RallySinger();
    $rallySinger->fill($input);
    $rallySinger->save();
    return $rallySinger;
  }
}
