<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

/** Sign in with email and password, or (while DEMO_LOGIN is on) with one press. */
class AuthController extends Controller
{
    public function show(): View
    {
        return view('auth.login', ['demo' => (bool) config('auth.demo_login')]);
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'Those details do not match our records.']);
        }
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    /** One press to sign in. Off when DEMO_LOGIN=false. */
    public function demo(Request $request): RedirectResponse
    {
        abort_unless(config('auth.demo_login'), 404);
        Auth::login(User::demo());
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
