<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ProfileRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetRequest;
use App\Http\Resources\UserResource;
use App\Mail\VerifyEmail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
  private $COOKIE_TIMEOUT = 60 * 24; // 60 mins * 24 hours = 1 day
  public function forgot(ForgotRequest $request)
  {
    $data = $request->validated();
    $pin = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);
    $password_reset = DB::table('password_resets')->insert([
      'email' => $data['email'],
      'token' => $pin,
      'created_at' => Carbon::now()
    ]);
    if ($password_reset)
    {
      Mail::to($data['email'])->send(new VerifyEmail($pin));
      return new JsonResponse(
        [
          'success' => true,
          'message' => 'Verification email sent successfully'
        ],
        200
      );
    }
  }
  public function login(LoginRequest $request)
  {
    $data = $request->validated();
    $user = User::where('email', $data['email'])->first();
    if (!$user || !Hash::check($data['password'], $user->password))
    {
      return response()->json(['message' => 'Email or password is incorrect'], 401);
    }
    $token = $user->createToken('auth_token')->plainTextToken;
    $cookie = cookie('token', $token, $this->COOKIE_TIMEOUT);
    return response()->json(['user' => new UserResource($user)])->withCookie($cookie);
  }
  public function logout(Request $request)
  {
    $request->user()->currentAccessToken()->delete();
    $cookie = cookie()->forget('token');
    return response()->json(['message' => 'Logged out successfully'])->withCookie($cookie);
  }
  public function profile(ProfileRequest $request)
  {
    $data = $request->validated();
    $user = User::where('email', $data['prev_email'])->first();
    if (!$user)
    {
      return response()->json(['message' => 'Could not find user to update'], 401);
    }
    $updates = [
      'email' => $data['email'],
      'name' => $data['name']
    ];
    if (isset($data['password']))
    {
      $updates['password'] = Hash::make($data['password']);
    }
    $user->update($updates);
    $token = $user->createToken('auth_token')->plainTextToken;
    $cookie = cookie('token', $token, $this->COOKIE_TIMEOUT);
    return response()->json(['user' => new UserResource($user)])->withCookie($cookie);
  }
  public function register(RegisterRequest $request)
  {
    $data = $request->validated();
    $user = User::create([
      'email' => $data['email'],
      'name' => $data['name'],
      'password' => Hash::make($data['password']),
    ]);
    $token = $user->createToken('auth_token')->plainTextToken;
    $cookie = cookie('token', $token, $this->COOKIE_TIMEOUT);
    return response()->json(['user' => new UserResource($user)])->withCookie($cookie);
  }
  public function reset(ResetRequest $request)
  {
    $data = $request->validated();
    $matching_resets = DB::table('password_resets')
      ->where('email', '=', $data['email'])
      ->where('token', '=', $data['token']);
    $reset = $matching_resets->first();
    if (!$reset)
    {
      return response()->json(['message' => 'Email or reset token is incorrect'], 401);
    }
    $matching_resets->delete();
    $user = User::where('email', $data['email'])->first();
    $user->update(['password' => Hash::make($data['password'])]);
    $token = $user->createToken('auth_token')->plainTextToken;
    $cookie = cookie('token', $token, $this->COOKIE_TIMEOUT);
    return response()->json(['user' => new UserResource($user)])->withCookie($cookie);
  }
  public function user(Request $request)
  {
    return new UserResource($request->user());
  }
}
