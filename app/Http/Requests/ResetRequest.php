<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   *
   * @return bool
   */
  public function authorize()
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array
   */
  public function rules()
  {
    return [
      'email' => 'email|required|max:191|exists:users,email|exists:password_resets,email',
      'token' => 'string|required|exists:password_resets,token',
      'password' => [
        'required',
        'string',
        'max:191',
        Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised(),
        'confirmed'
      ]
    ];
  }
}
