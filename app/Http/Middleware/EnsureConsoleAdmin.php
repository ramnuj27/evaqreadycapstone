<?php

namespace App\Http\Middleware;

use App\Support\ConsoleRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureConsoleAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role = $request->user()?->role;
        $barangay = $request->user()?->barangay;

        abort_unless(
            ConsoleRole::isConsoleAdmin($role)
                && (! ConsoleRole::isBarangayCommittee($role) || (is_string($barangay) && $barangay !== '')),
            Response::HTTP_FORBIDDEN,
        );

        return $next($request);
    }
}
