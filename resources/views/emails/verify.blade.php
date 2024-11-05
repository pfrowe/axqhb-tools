@component('mail::message')
# Introduction

Please use the following pin to reset your password.
# {{$pin}}

Thanks,<br />
{{ config('app.name') }}
@endcomponent