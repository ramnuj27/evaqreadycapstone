<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        $request->user()?->loadMissing('household');

        $householdId = $request->user()?->household?->id;

        if ($householdId === null) {
            return redirect()->intended(Fortify::redirects('register'));
        }

        $request->session()->put('registration_success_household_id', $householdId);

        Auth::guard(config('fortify.guard'))->logout();
        $request->session()->regenerateToken();

        return to_route('register.success');
    }
}
