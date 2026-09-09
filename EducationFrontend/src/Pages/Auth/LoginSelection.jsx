import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { blogApi, setStudentToken, setTeacherToken } from '../../api/blogApi';
import '../../CSS/Auth/LoginSelection.css';

export default function LoginSelection() {
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    if (newRole !== role) {
      setRole(newRole);
      setError('');
      setInfoMsg('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfoMsg('');
    try {
      const res =
        role === 'teacher'
          ? await blogApi.teacherLogin({ email, password })
          : await blogApi.studentLogin({ email, password });

      if (role === 'teacher') {
        setTeacherToken(res.token);
        navigate('/teacher');
      } else {
        setStudentToken(res.token);
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="portal-login-page">
      <div className="login-card-container">
        {/* Brand Tag */}
        <div className="login-brand-tag">
          <span>FLUENCYHUBB</span>
        </div>

        {/* Segmented Pill Tabs for Teacher / Student */}
        <div className="login-segmented-tabs" role="tablist" aria-label="Login Role">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'teacher'}
            className={`tab-pill-btn ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => handleRoleChange('teacher')}
          >
            Teacher
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'student'}
            className={`tab-pill-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="login-header-text">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            {role === 'teacher'
              ? 'Log in to your teaching dashboard'
              : 'Log in to your learning dashboard'}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="login-alert login-alert-error" role="alert">
            <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="login-alert login-alert-info" role="status">
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={submit}>
          {/* Email Input */}
          <div className="form-group">
            <div className="input-field-wrapper">
              <span className="input-icon left-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'teacher' ? 'teacher@fluencyhubb.com' : 'student@fluencyhubb.com'}
                required
                autoComplete="email"
                className="custom-input"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="input-field-wrapper">
              <span className="input-icon left-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="custom-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={busy} className="login-submit-btn">
            {busy ? (
              <span className="btn-loading-state">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="login-card-footer">
          <Link to="/" className="back-home-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
