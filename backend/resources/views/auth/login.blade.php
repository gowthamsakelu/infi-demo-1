<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>INFINITY - CRM PANEL</title>
  
  <!-- Company Monogram Favicon -->
  <link rel="icon" type="image/png" href="{{ asset('images/infinity-favicon.png') }}">
  <link rel="shortcut icon" type="image/png" href="{{ asset('images/infinity-favicon.png') }}">
  <link rel="apple-touch-icon" href="{{ asset('images/infinity-favicon.png') }}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body.login-page {
      min-height: 100dvh;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F4F6FB;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      -webkit-font-smoothing: antialiased;
    }

    .login-container {
      width: 100%;
      max-width: 375px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Main Login Card */
    .login-card {
      width: 100%;
      background: #FFFFFF;
      border-radius: 28px;
      box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.04), 0 4px 10px -2px rgba(15, 23, 42, 0.02);
      border: 1px solid #EEF2F6;
      padding: 38px 30px 32px 30px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    /* Card Top Logo & Brand */
    .card-logo-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 2px;
    }

    .card-logo-img {
      width: 145px;
      max-width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }

    .card-crm-badge {
      font-size: 11px;
      font-weight: 800;
      color: #35478C;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      text-align: center;
      margin-top: 14px;
      margin-bottom: 24px;
    }

    /* Form Fields */
    .login-form {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
      width: 100%;
    }

    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
      display: block;
    }

    .field-input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 10px;
      font-family: inherit;
      font-size: 13.5px;
      color: #1E293B;
      outline: none;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    .field-input::placeholder {
      color: #94A3B8;
      font-size: 13px;
    }

    .field-input:focus {
      border-color: #2563EB;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .field-input.has-error {
      border-color: #EF4444;
      background: #FEF2F2;
    }

    .error-msg {
      font-size: 11px;
      font-weight: 600;
      color: #EF4444;
      margin-top: 2px;
    }

    /* Remember Me Checkbox */
    .remember-row {
      margin-top: 2px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
    }

    .remember-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
    }

    .remember-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      accent-color: #2563EB;
      cursor: pointer;
    }

    /* Sign in Primary Button */
    .btn-signin {
      width: 100%;
      height: 44px;
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
    }

    .btn-signin:hover {
      background: #1D4ED8;
    }

    .btn-signin:active {
      transform: translateY(0.5px);
    }

    /* Demo Quick Access */
    .demo-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .demo-label {
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
      margin-top: 22px;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .btn-press-login {
      width: 100%;
      height: 44px;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 10px;
      color: #1E293B;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    .btn-press-login:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
      color: #0F172A;
    }

    .btn-press-login:active {
      transform: translateY(0.5px);
    }

    /* Footer Security */
    .tls-security-footer {
      font-size: 11.5px;
      color: #94A3B8;
      text-align: center;
      margin-top: 20px;
      font-weight: 400;
      letter-spacing: 0.01em;
    }
  </style>
</head>
<body class="login-page">
  <div class="login-container">
    <!-- Main Card -->
    <main class="login-card">
      <!-- Full Logo with Tagline inside Card -->
      <div class="card-logo-wrap">
        <img 
          src="{{ asset('images/infinity-login-logo.png') }}" 
          alt="INFINITY - Infinite Freight, Infinite Ways" 
          class="card-logo-img"
        />
      </div>

      <!-- CRM PANEL Subtitle -->
      <div class="card-crm-badge">CRM PANEL</div>

      <!-- Login Form -->
      <form method="POST" action="{{ route('login.attempt') }}" class="login-form" novalidate>
        @csrf

        <div class="field-group">
          <label for="email" class="field-label">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            value="{{ old('email') }}" 
            autocomplete="username" 
            placeholder="you@company.com" 
            class="field-input {{ $errors->has('email') ? 'has-error' : '' }}" 
            required 
            autofocus
          />
          @error('email')
            <span class="error-msg" role="alert">{{ $message }}</span>
          @enderror
        </div>

        <div class="field-group">
          <label for="password" class="field-label">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            autocomplete="current-password" 
            placeholder="Password" 
            class="field-input {{ $errors->has('password') ? 'has-error' : '' }}" 
            required
          />
          @error('password')
            <span class="error-msg" role="alert">{{ $message }}</span>
          @enderror
        </div>

        <div class="remember-row">
          <label class="remember-label">
            <input type="checkbox" name="remember" value="1" {{ old('remember') ? 'checked' : '' }}>
            <span>Keep me signed in</span>
          </label>
        </div>

        <button type="submit" class="btn-signin">Sign in</button>
      </form>

      @if ($demo)
        <!-- Demo Access -->
        <div class="demo-wrapper">
          <div class="demo-label">Just looking around?</div>
          <form method="POST" action="{{ route('login.demo') }}" style="width: 100%;">
            @csrf
            <button type="submit" class="btn-press-login">Press to log in</button>
          </form>
        </div>
      @endif
    </main>

    <!-- TLS Security Footer -->
    <footer class="tls-security-footer">
      Protected by enterprise-grade TLS encryption
    </footer>
  </div>
</body>
</html>
