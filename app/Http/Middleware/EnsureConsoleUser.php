<?php

namespace App\Http\Middleware;

use App\Support\ConsoleRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureConsoleUser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role = $request->user()?->role;

        if (ConsoleRole::isConsoleUser($role)) {
            return $next($request);
        }

        if (ConsoleRole::isResident($role) && $request->routeIs('dashboard')) {
            return redirect()->route('resident.dashboard');
        }

        abort(Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
