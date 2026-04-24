<?php

namespace App\Http\Middleware;

use App\Support\ConsoleRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOperator
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            ConsoleRole::isOperator($request->user()?->role),
            Response::HTTP_FORBIDDEN,
        );

        return $next($request);
    }
}
