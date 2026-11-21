<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in - INFINITY</title>
  <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body class="login-page">
  <main class="modal-card login-card" aria-labelledby="login-title">
    <header class="modal-header login-head">
      <div class="login-brand">
        <span class="brand-icon-box" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>
        </span>
        <div><h1 id="login-title">Sign in</h1><p>INFINITY · Freight & Logistics CRM</p></div>
      </div>
    </header>

    <form method="POST" action="{{ route('login.attempt') }}" class="modal-body login-body" novalidate>
      @csrf
      <div class="form-group">
        <label for="login-email">Email</label>
        <input id="login-email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" maxlength="190" placeholder="you@company.com">
        @error('email')<p class="fu-error" role="alert">{{ $message }}</p>@enderror
      </div>
      <div class="form-group">
        <label for="login-password">Password</label>
        <input id="login-password" name="password" type="password" autocomplete="current-password" maxlength="200" placeholder="Password">
        @error('password')<p class="fu-error" role="alert">{{ $message }}</p>@enderror
      </div>
      <label class="bld-check"><input type="checkbox" name="remember" value="1"><span>Keep me signed in</span></label>
      <button type="submit" class="btn-primary-desktop login-btn">Sign in</button>
    </form>

    @if ($demo)
      <form method="POST" action="{{ route('login.demo') }}" class="login-demo">
        @csrf
        <p>Just looking around?</p>
        <button type="submit" class="btn-secondary-desktop login-btn">Press to log in</button>
      </form>
    @endif
  </main>
</body>
</html>
