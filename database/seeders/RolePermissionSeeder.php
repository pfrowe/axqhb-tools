<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    // Set up the different roles.
    $adminRole = Role::create(['name' => 'admin']);
    $superRole = Role::create(['name' => 'super']);
    $permissions = [
      ['name' => '*', 'roles' => [$superRole]],
      ['name' => 'rally.*', 'roles' => [$superRole]],
      ['name' => 'rally.browse.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'rally.create.*', 'roles' => [$superRole]],
      ['name' => 'rally.delete.*', 'roles' => [$superRole]],
      ['name' => 'rally.populate.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'rally.read.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'rally.update.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'user.*', 'roles' => [$superRole]],
      ['name' => 'user.browse.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'user.create.*', 'roles' => [$superRole]],
      ['name' => 'user.delete.*', 'roles' => [$superRole]],
      ['name' => 'user.read.*', 'roles' => [$adminRole, $superRole]],
      ['name' => 'user.update.*', 'roles' => [$superRole]],
    ];
    foreach ($permissions as $permission)
    {
      $permThis = Permission::create(['name' => $permission['name']]);
      foreach ($permission['roles'] as $role)
      {
        $role->givePermissionTo($permThis);
      }
    }
    $users = User::all();
    foreach ($users as $user)
    {
      $user->assignRole('super');
    }
  }
}
