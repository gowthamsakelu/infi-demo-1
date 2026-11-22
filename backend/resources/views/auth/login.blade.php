<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · INFINITY - Infinite Freight, Infinite Ways</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --primary: #2563EB;
      --primary-dark: #1D4ED8;
      --primary-gradient: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      --accent-purple: #6366F1;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-400: #94A3B8;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1E293B;
      --slate-900: #0F172A;
      --danger: #EF4444;
      --danger-bg: #FEF2F2;
    }

    body.login-page {
      min-height: 100dvh;
      font-family: var(--font-family);
      background: radial-gradient(circle at 50% 0%, #EEF2FF 0%, #F8FAFC 50%, #F1F5F9 100%);
      color: var(--slate-900);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient background grid pattern */
    body.login-page::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(var(--slate-200) 1px, transparent 1px),
        radial-gradient(var(--slate-200) 1px, transparent 1px);
      background-size: 32px 32px;
      background-position: 0 0, 16px 16px;
      opacity: 0.6;
      pointer-events: none;
      z-index: 0;
    }

    /* Subtle atmospheric glow behind card */
    .ambient-glow {
      position: absolute;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }

    .login-container {
      width: 100%;
      max-width: 430px;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    /* Brand Header Box */
    .brand-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 4px;
    }

    .brand-logo-wrap {
      width: 180px;
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
    }

    .brand-logo-img {
      width: 100%;
      height: auto;
      object-fit: contain;
      mix-blend-mode: multiply;
    }

    .brand-tagline-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #E0E7FF;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      color: #4F46E5;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.08);
      backdrop-filter: blur(8px);
    }

    .brand-tagline-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4F46E5;
      display: inline-block;
    }

    /* Login Card */
    .login-main-card {
      width: 100%;
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      border-radius: 20px;
      box-shadow: 
        0 1px 3px rgba(15, 23, 42, 0.04),
        0 12px 32px -8px rgba(15, 23, 42, 0.08);
      padding: 28px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-heading {
      text-align: left;
    }

    .card-heading h1 {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .card-heading p {
      font-size: 12.5px;
      color: var(--slate-500);
      font-weight: 500;
      line-height: 1.4;
    }

    /* Form Layout */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-700);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      color: var(--slate-400);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-input {
      width: 100%;
      height: 44px;
      padding: 0 14px 0 38px;
      font-family: inherit;
      font-size: 13.5px;
      color: var(--slate-900);
      background: var(--slate-50);
      border: 1.5px solid var(--slate-200);
      border-radius: 10px;
      outline: none;
      transition: all 0.18s ease;
    }

    .form-input::placeholder {
      color: var(--slate-400);
      font-size: 13px;
    }

    .form-input:focus {
      background: #FFFFFF;
      border-color: var(--primary);
      box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.12);
    }

    .form-input.input-error {
      border-color: var(--danger);
      background: var(--danger-bg);
    }

    .input-error-msg {
      font-size: 11px;
      font-weight: 600;
      color: var(--danger);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Remember me & Options */
    .form-options-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: -2px;
    }

    .remember-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--slate-600);
      user-select: none;
    }

    .remember-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      accent-color: var(--primary);
      cursor: pointer;
    }

    /* Primary Sign In Button */
    .btn-submit-login {
      width: 100%;
      height: 45px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary-gradient);
      border: 0;
      border-radius: 10px;
      color: #FFFFFF;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      letter-spacing: 0.01em;
    }

    .btn-submit-login:hover {
      background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
      transform: translateY(-1px);
    }

    .btn-submit-login:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }

    /* Divider */
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      margin: 2px 0;
    }

    .auth-divider::before,
    .auth-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--slate-200);
    }

    .auth-divider span {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--slate-400);
    }

    /* Demo Login Section */
    .demo-login-box {
      width: 100%;
    }

    .btn-demo-access {
      width: 100%;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.5px solid var(--slate-200);
      border-radius: 10px;
      color: var(--slate-700);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .btn-demo-access:hover {
      background: var(--slate-50);
      border-color: var(--slate-300);
      color: var(--slate-900);
      transform: translateY(-0.5px);
    }

    .demo-chip {
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }

    /* Security & Copyright Footer */
    .auth-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-align: center;
      margin-top: 6px;
    }

    .auth-security-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 500;
      color: var(--slate-500);
    }

    .auth-copyright {
      font-size: 11px;
      color: var(--slate-400);
    }
  </style>
</head>
<body class="login-page">
  <div class="ambient-glow" aria-hidden="true"></div>

  <div class="login-container">
    <!-- Brand Hero Section -->
    <header class="brand-hero">
      <div class="brand-logo-wrap">
        <img 
          src="{{ asset('images/infinity-logo.png') }}" 
          alt="INFINITY Logo" 
          class="brand-logo-img"
        />
      </div>
      <div class="brand-tagline-badge">
        <span class="brand-tagline-dot"></span>
        <span>Infinite Freights and Infinite Ways</span>
      </div>
    </header>

    <!-- Main Sign In Card -->
    <main class="login-main-card">
      <div class="card-heading">
        <h1>Sign In</h1>
        <p>Access your freight intelligence, shipments &amp; live operations.</p>
      </div>

      <form method="POST" action="{{ route('login.attempt') }}" class="auth-form" novalidate>
        @csrf

        <!-- Email Field -->
        <div class="input-field-group">
          <label for="login-email" class="input-label">Email Address</label>
          <div class="input-wrapper">
            <span class="input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <input 
              id="login-email" 
              name="email" 
              type="email" 
              value="{{ old('email') }}" 
              autocomplete="username" 
              maxlength="190" 
              placeholder="you@company.com"
              class="form-input {{ $errors->has('email') ? 'input-error' : '' }}"
              required
            />
          </div>
          @error('email')
            <p class="input-error-msg" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ $message }}
            </p>
          @enderror
        </div>

        <!-- Password Field -->
        <div class="input-field-group">
          <label for="login-password" class="input-label">Password</label>
          <div class="input-wrapper">
            <span class="input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input 
              id="login-password" 
              name="password" 
              type="password" 
              autocomplete="current-password" 
              maxlength="200" 
              placeholder="••••••••"
              class="form-input {{ $errors->has('password') ? 'input-error' : '' }}"
              required
            />
          </div>
          @error('password')
            <p class="input-error-msg" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ $message }}
            </p>
          @enderror
        </div>

        <!-- Remember Me Checkbox -->
        <div class="form-options-row">
          <label class="remember-label">
            <input type="checkbox" name="remember" value="1" {{ old('remember') ? 'checked' : '' }}>
            <span>Keep me signed in</span>
          </label>
        </div>

        <!-- Sign In Button -->
        <button type="submit" class="btn-submit-login">
          <span>Sign In to Portal</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </button>
      </form>

      @if ($demo)
        <div class="auth-divider">
          <span>or quick access</span>
        </div>

        <!-- Demo 1-Click Access -->
        <form method="POST" action="{{ route('login.demo') }}" class="demo-login-box">
          @csrf
          <button type="submit" class="btn-demo-access">
            <span class="demo-chip">Instant Demo</span>
            <span>Press to log in directly</span>
          </button>
        </form>
      @endif
    </main>

    <!-- Footer security badge -->
    <footer class="auth-footer">
      <div class="auth-security-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
        <span>Enterprise 256-Bit SSL Freight Security</span>
      </div>
      <p class="auth-copyright">&copy; {{ date('Y') }} INFINITY Freight &amp; Logistics CRM. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
