import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';

function Login({ onLogin, users, onResetPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Forgot-password modal state — multi-step flow:
  //  'email'  → enter account email, app generates a verification code
  //  'verify' → enter the code that was "emailed"
  //  'reset'  → enter the new password
  //  'done'   → success confirmation
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [forgotError, setForgotError] = useState('');

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotEmail('');
    setGeneratedCode('');
    setEnteredCode('');
    setForgotNewPassword('');
    setForgotConfirm('');
    setForgotError('');
  };

  // Step 1: validate the email exists, then "send" a 6-digit verification code.
  // In a real app this would be emailed; here we surface it in the UI banner.
  const handleSendCode = (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Please enter your email');
      return;
    }
    const target = (users || []).find((u) => u.email === forgotEmail);
    if (!target) {
      setForgotError('No account found with that email');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setForgotStep('verify');
  };

  // Step 2: confirm the user typed the same code we generated.
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setForgotError('');
    if (enteredCode.trim() !== generatedCode) {
      setForgotError('Incorrect verification code');
      return;
    }
    setForgotStep('reset');
  };

  // Step 3: actually update the password (now via the API).
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotNewPassword || !forgotConfirm) {
      setForgotError('Please fill in all fields');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirm) {
      setForgotError('Passwords do not match');
      return;
    }
    try {
      await authApi.resetPassword(forgotEmail, forgotNewPassword);
      setForgotStep('done');
    } catch (err) {
      setForgotError(err.message || 'Could not update password');
    }
  };

  // Re-issue a fresh code if the user wants one.
  const handleResendCode = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setEnteredCode('');
    setForgotError('');
  };

  const allUsers = users || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // STEP 1 — Try the hardcoded admin / local users first (legacy).
    const localUser = allUsers.find((u) => u.email === email && u.password === password);
    if (localUser) {
      onLogin(localUser);
      navigate(`/${localUser.role}`);
      return;
    }

    // STEP 2 — Otherwise call the real API (the database does the password check).
    try {
      const user = await authApi.login(email, password);
      // The API returns { id, name, email, role, group, children }.
      // Our dashboards still expect a "childIds" array — derive it from "children".
      const userWithChildIds = {
        ...user,
        childIds: (user.children || []).map((c) => c.id),
      };
      onLogin(userWithChildIds);
      navigate(`/${userWithChildIds.role}`);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-decor login-decor-1">🍃</div>
      <div className="login-decor login-decor-2">🌿</div>
      <div className="login-decor login-decor-3">🌼</div>
      <div className="login-decor login-decor-4">🦋</div>
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to your NestSync+ account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="forgot-password-row">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>New to NestSync+? <Link to="/signup">Create an account</Link></p>
        </div>

      </div>

      {showForgot && (
        <div className="modal-overlay" onClick={closeForgot}>
          <div className="modal-content forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {forgotStep === 'email' && 'Reset your password'}
                {forgotStep === 'verify' && 'Check your email'}
                {forgotStep === 'reset' && 'Choose a new password'}
                {forgotStep === 'done' && 'Password updated'}
              </h3>
              <button type="button" className="modal-close" onClick={closeForgot}>×</button>
            </div>

            {/* Step 1 — enter email */}
            {forgotStep === 'email' && (
              <form onSubmit={handleSendCode} autoComplete="off">
                {forgotError && <div className="login-error">{forgotError}</div>}
                <p className="forgot-hint">
                  Enter the email linked to your NestSync+ account. We&apos;ll send a verification code to confirm it&apos;s really you.
                </p>
                <div className="form-group">
                  <label htmlFor="forgot-email">Account email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your account email"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeForgot}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send code
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 — verify code */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyCode} autoComplete="off">
                {forgotError && <div className="login-error">{forgotError}</div>}
                <div className="forgot-code-banner">
                  <span className="forgot-code-icon">📧</span>
                  <div>
                    <strong>Verification code sent to {forgotEmail}</strong>
                    <p>
                      For this demo the code is shown here instead of being emailed:
                    </p>
                    <div className="forgot-code-value">{generatedCode}</div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-code">Enter the 6-digit code</label>
                  <input
                    id="forgot-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="forgot-resend-row">
                  <button type="button" className="forgot-password-link" onClick={handleResendCode}>
                    Resend code
                  </button>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setForgotStep('email'); setForgotError(''); }}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Verify
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 — set new password */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetSubmit} autoComplete="off">
                {forgotError && <div className="login-error">{forgotError}</div>}
                <p className="forgot-hint">
                  Email <strong>{forgotEmail}</strong> verified. Choose a new password below.
                </p>
                <div className="form-group">
                  <label htmlFor="forgot-new">New password</label>
                  <input
                    id="forgot-new"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-confirm">Confirm new password</label>
                  <input
                    id="forgot-confirm"
                    type="password"
                    value={forgotConfirm}
                    onChange={(e) => setForgotConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeForgot}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update password
                  </button>
                </div>
              </form>
            )}

            {/* Step 4 — done */}
            {forgotStep === 'done' && (
              <>
                <div className="login-success">
                  Password updated! You can now sign in with your new password.
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-primary btn-full" onClick={closeForgot}>
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
