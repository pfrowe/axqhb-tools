<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ProfileRequest extends FormRequest
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
      'email' => 'required|email|max:191',
      'first_name' => 'required|string|max:191',
      'last_name' => 'required|string|max:191',
      'password' => [
        'string',
        'max:191',
        Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised(),
        'confirmed'
      ],
      'preferred_name' => 'string|max:191|nullable',
      'prev_email' => 'required|email|exists:users,email|max:191'
    ];
  }
}
