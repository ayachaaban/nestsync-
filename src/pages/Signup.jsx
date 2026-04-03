import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Auto-assignment mapping based on age
const getLevelInfo = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 4) return { age, level: 'Preschool', group: 'Bumble Bees', teacher: 'Nora Khalid' };
  if (age === 4) return { age, level: 'KG1', group: 'Honey Bees', teacher: 'Layla Ibrahim' };
  return { age, level: 'KG2', group: 'Busy Bees', teacher: 'Nora Khalid' };
};

function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent',
    childName: '',
    childDob: '',
    childGender: '',
    childGroup: 'Bumble Bees',
    childPhoto: '',
    staffGroup: '',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const levelInfo = getLevelInfo(form.childDob);

  const updateField = (field, value) => {
    if (field === 'childDob') {
      const info = getLevelInfo(value);
      setForm({ ...form, childDob: value, childGroup: info ? info.group : 'Bumble Bees' });
    } else {
      setForm({ ...form, [field]: value });
    }
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please enter your full name');
    if (!form.email.trim()) return setError('Please enter your email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.role === 'parent') {
      if (!form.childName.trim()) return setError('Please enter your child\'s name');
      if (!form.childGender) return setError('Please select your child\'s gender');
      if (!form.childDob) return setError('Please select your child\'s date of birth');
      if (!levelInfo || levelInfo.age < 2 || levelInfo.age > 6) return setError('Child must be between 2 and 6 years old');
    }
    if (form.role === 'staff' && !form.staffGroup) {
      return setError('Please select your group');
    }

    const newUser = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      ...(form.role === 'staff' && { group: form.staffGroup }),
      ...(form.role === 'parent' && {
        childIds: [Date.now() + 1],
        child: {
          id: Date.now() + 1,
          name: form.childName,
          dob: form.childDob,
          gender: form.childGender,
          age: levelInfo.age,
          level: levelInfo.level,
          group: levelInfo.group,
          teacher: levelInfo.teacher,
          avatar: form.childPhoto || '',
          allergies: 'None',
          bloodType: 'N/A',
        },
      }),
    };

    onSignup(newUser);
    navigate(`/${newUser.role}`);
  };

  return (
    <div className="login-page signup-page">
      <div className="login-container signup-container">
        <div className="login-header">
          <h1>NestSync+</h1>
          <p>Create your account</p>
        </div>

        {step === 1 && (
          <>
            <p className="role-select-label">I am a</p>
            <div className="quick-login">
              <button type="button" className={`btn btn-demo parent ${form.role === 'parent' ? 'active' : ''}`} onClick={() => updateField('role', 'parent')}>
                Parent
              </button>
              <button type="button" className={`btn btn-demo staff ${form.role === 'staff' ? 'active' : ''}`} onClick={() => updateField('role', 'staff')}>
                Staff
              </button>
            </div>
          </>
        )}

        {error && <div className="login-error">{error}</div>}

        {step === 1 && (
          <form className="login-form" onSubmit={handleNext}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="password-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="At least 6 characters"
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
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="login-form" onSubmit={handleSubmit}>
            {form.role === 'parent' && (
              <>
                <div className="role-detail-header">
                  <h3>Child Information</h3>
                  <p>Tell us about your child</p>
                </div>
                <div className="child-photo-upload">
                  {form.childPhoto ? (
                    <img className="child-photo-preview" src={form.childPhoto} alt="Child" />
                  ) : (
                    <div className="child-photo-placeholder">Add photo</div>
                  )}
                  <label htmlFor="child-photo">Upload Photo</label>
                  <input
                    id="child-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateField('childPhoto', reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="child-name">Child&apos;s Name</label>
                  <input
                    id="child-name"
                    type="text"
                    value={form.childName}
                    onChange={(e) => updateField('childName', e.target.value)}
                    placeholder="Enter your child's name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div className="gender-selector">
                    <button
                      type="button"
                      className={`gender-option ${form.childGender === 'male' ? 'active male' : ''}`}
                      onClick={() => updateField('childGender', 'male')}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      className={`gender-option ${form.childGender === 'female' ? 'active female' : ''}`}
                      onClick={() => updateField('childGender', 'female')}
                    >
                      Female
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="child-dob">Date of Birth</label>
                  <input
                    id="child-dob"
                    type="date"
                    value={form.childDob}
                    onChange={(e) => updateField('childDob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                {levelInfo && (
                  <div className="auto-assign-info">
                    <h4>Auto-Assigned Details</h4>
                    <div className="assign-grid">
                      <div className="assign-item">
                        <span className="assign-label">Age</span>
                        <span className="assign-value">{levelInfo.age} years</span>
                      </div>
                      <div className="assign-item">
                        <span className="assign-label">Level</span>
                        <span className="assign-value">{levelInfo.level}</span>
                      </div>
                      <div className="assign-item">
                        <span className="assign-label">Group</span>
                        <span className="assign-value">{levelInfo.group}</span>
                      </div>
                      <div className="assign-item">
                        <span className="assign-label">Teacher</span>
                        <span className="assign-value">{levelInfo.teacher}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {form.role === 'staff' && (
              <>
                <div className="role-detail-header">
                  <h3>Staff Registration</h3>
                  <p>Select the group you are leading</p>
                </div>
                <div className="form-group">
                  <label htmlFor="staff-group">Group Leader Of</label>
                  <select
                    id="staff-group"
                    value={form.staffGroup}
                    onChange={(e) => updateField('staffGroup', e.target.value)}
                    required
                  >
                    <option value="">Select group</option>
                    <option value="Bumble Bees">Bumble Bees (Preschool)</option>
                    <option value="Honey Bees">Honey Bees (KG1)</option>
                    <option value="Busy Bees">Busy Bees (KG2)</option>
                  </select>
                </div>
              </>
            )}


<div className="signup-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setStep(1); setError(''); }}>
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>Already have an account? <Link to="/">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
