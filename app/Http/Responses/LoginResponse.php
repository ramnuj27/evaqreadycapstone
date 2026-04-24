<?php

namespace App\Http\Responses;

use App\Support\ConsoleRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        if (ConsoleRole::isOperator($request->user()?->role)) {
            return redirect()->intended(route('operator-dashboard'));
        }

        if (ConsoleRole::isConsoleUser($request->user()?->role)) {
            return redirect()->intended(route('dashboard'));
        }

        $this->forgetBlockedResidentIntendedUrl($request);

        return redirect()->intended(route('resident.dashboard'));
    }

    private function forgetBlockedResidentIntendedUrl(Request $request): void
    {
        $intendedUrl = $request->session()->get('url.intended');

        if (! is_string($intendedUrl)) {
            return;
        }

        $intendedPath = parse_url($intendedUrl, PHP_URL_PATH);

        if (! is_string($intendedPath)) {
            return;
        }

        if (
            str_starts_with($intendedPath, '/resident/')
            || str_starts_with($intendedPath, '/settings/')
        ) {
            return;
        }

        $request->session()->forget('url.intended');
    }
}
