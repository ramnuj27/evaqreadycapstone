<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\MatiCityAddressOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedPayload($request, requiresPassword: true);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'contact_number' => $validated['contact_number'] ?? null,
            'role' => $validated['role'],
            'barangay' => $this->normalizedBarangay(
                $request,
                $validated['role'],
                $validated['barangay'] ?? null,
            ),
        ]);

        return to_route('user-management')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->canManageUser($request, $user), 403);

        $validated = $this->validatedPayload($request, $user);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'role' => $validated['role'],
            'barangay' => $this->normalizedBarangay(
                $request,
                $validated['role'],
                $validated['barangay'] ?? null,
            ),
        ]);

        return to_route('user-management')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->canManageUser($request, $user), 403);

        $user->delete();

        return to_route('user-management')->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->canManageUser($request, $user), 403);

        $user->update([
            'status' => $user->status === 'Active' ? 'Inactive' : 'Active',
        ]);

        return to_route('user-management')->with('success', 'User status updated successfully.');
    }

    /**
     * @return array{
     *     barangay?: string|null,
     *     contact_number?: string|null,
     *     email: string,
     *     name: string,
     *     password?: string,
     *     role: string
     * }
     */
    private function validatedPayload(
        Request $request,
        ?User $user = null,
        bool $requiresPassword = false,
    ): array {
        $passwordRules = ['nullable', 'string', 'min:8'];
        $allowedRoles = $this->allowedRolesFor($request);
        $barangayRules = $this->barangayRulesFor($request);

        if ($requiresPassword) {
            $passwordRules[0] = 'required';
        }

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user),
            ],
            'password' => $passwordRules,
            'contact_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'barangay' => $barangayRules,
        ]);
    }

    private function normalizedBarangay(Request $request, string $role, mixed $barangay): ?string
    {
        if ($this->isBarangayCommittee($request)) {
            return $request->user()?->barangay;
        }

        if (! is_string($barangay) || $barangay === '') {
            return null;
        }

        return ConsoleRole::isCdrrmoAdmin($role) ? null : $barangay;
    }

    /**
     * @return array<int, string>
     */
    private function allowedRolesFor(Request $request): array
    {
        if ($this->isBarangayCommittee($request)) {
            return [ConsoleRole::BARANGAY_COMMITTEE, ConsoleRole::OPERATOR];
        }

        return [ConsoleRole::CDRRMO_ADMIN, ConsoleRole::BARANGAY_COMMITTEE, ConsoleRole::OPERATOR];
    }

    /**
     * @return array<int, mixed>
     */
    private function barangayRulesFor(Request $request): array
    {
        if ($this->isBarangayCommittee($request)) {
            return ['nullable', 'string', 'max:255'];
        }

        return [
            Rule::requiredIf(
                fn (): bool => $request->string('role')->toString() === ConsoleRole::BARANGAY_COMMITTEE,
            ),
            'nullable',
            'string',
            Rule::in(MatiCityAddressOptions::barangays()),
        ];
    }

    private function canManageUser(Request $request, User $user): bool
    {
        if (! ConsoleRole::isConsoleUser($user->role) || $user->household()->exists()) {
            return false;
        }

        if (! $this->isBarangayCommittee($request)) {
            return true;
        }

        $barangay = $request->user()?->barangay;

        return is_string($barangay)
            && $barangay !== ''
            && $user->barangay === $barangay
            && ! ConsoleRole::isCdrrmoAdmin($user->role);
    }

    private function isBarangayCommittee(Request $request): bool
    {
        return ConsoleRole::isBarangayCommittee($request->user()?->role);
    }
}
