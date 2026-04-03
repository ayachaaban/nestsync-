import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { users as defaultUsers } from '../data/mockData';

function Login({ onLogin, users }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const allUsers = users || defaultUsers;

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = allUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
      navigate(`/${user.role}`);
    } else {
      setError('Invalid email or password');
    }
  };

  const handleQuickLogin = (role) => {
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      onLogin(user);
      navigate(`/${user.role}`);
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
          <p className="role-select-label">I am a</p>
          <div className="quick-login">
            <button type="button" className="btn btn-demo parent" onClick={() => handleQuickLogin('parent')}>
              Parent
            </button>
            <button type="button" className="btn btn-demo staff" onClick={() => handleQuickLogin('staff')}>
              Staff
            </button>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>New to NestSync+? <Link to="/signup">Create an account</Link></p>
        </div>



      </div>
    </div>
  );
}

export default Login;
