<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/forgot', [AuthController::class, 'forgot']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/reset', [AuthController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function ()
{
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::post('/profile', [AuthController::class, 'profile']);
  Route::get('/user', [AuthController::class, 'user']);
});
