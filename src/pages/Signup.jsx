import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resizeImageFile } from '../utils/image';
import { authApi } from '../api';

// Auto-assignment mapping based on age. Teacher is looked up from the
// live registered staff list (whoever signed up as that group's leader).
const getLevelInfo = (dob, registeredUsers = []) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  const ageLabel = `${years} year${years === 1 ? '' : 's'}${months > 0 ? ` and ${months} month${months === 1 ? '' : 's'}` : ''}`;

  let level, group;
  if (years < 4) { level = 'Preschool'; group = 'Bumble Bees'; }
  else if (years === 4) { level = 'KG1'; group = 'Honey Bees'; }
  else { level = 'KG2'; group = 'Busy Bees'; }

  const groupStaff = registeredUsers.find((u) => u.role === 'staff' && u.group === group);
  const teacher = groupStaff ? groupStaff.name : 'Not yet assigned';

  return { age: years, months, ageLabel, level, group, teacher };
};

function Signup({ onSignup, registeredUsers = [] }) {
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
    childBloodType: '',
    childHasAllergies: 'no',
    childAllergies: '',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const levelInfo = getLevelInfo(form.childDob, registeredUsers);

  const updateField = (field, value) => {
    if (field === 'childDob') {
      const info = getLevelInfo(value, registeredUsers);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.role === 'parent') {
      if (!form.childName.trim()) return setError('Please enter your child\'s name');
      if (!form.childGender) return setError('Please select your child\'s gender');
      if (!form.childDob) return setError('Please select your child\'s date of birth');
      if (!levelInfo || levelInfo.age < 2 || levelInfo.age > 6) return setError('Child must be between 2 and 6 years old');
      if (!form.childBloodType) return setError('Please select your child\'s blood type');
      if (form.childHasAllergies === 'yes' && !form.childAllergies.trim()) return setError('Please describe your child\'s allergies');
    }

    // Build the payload for the API — matches the backend's SignupDto.
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'parent',
      childName: form.childName,
      childDob: form.childDob,
      childGender: form.childGender,
      childAge: levelInfo.age,
      childAgeMonths: levelInfo.months,
      childLevel: levelInfo.level,
      childGroup: levelInfo.group,
      childTeacher: levelInfo.teacher,
      childAvatar: form.childPhoto || null,
      childAllergies: form.childHasAllergies === 'yes' ? form.childAllergies.trim() : 'None',
      childBloodType: form.childBloodType,
    };

    try {
      // The API returns: { id, name, email, role, child }
      const apiUser = await authApi.signup(payload);

      // Shape the response so the rest of the app keeps working.
      const newUser = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        password: form.password,             // kept in memory only (for legacy code)
        role: apiUser.role,
        childIds: apiUser.child ? [apiUser.child.id] : [],
        child: apiUser.child,
      };

      onSignup(newUser);
      navigate(`/${newUser.role}`);
    } catch (err) {
      setError(err.message || 'Could not create account');
    }
  };

  return (
    <div className="login-page signup-page">
      <div className="login-container signup-container">
        {step === 1 && (
          <div className="login-header">
            <h1 style={{ fontSize: '24px', whiteSpace: 'nowrap' }}>Create your account</h1>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        {step === 1 && (
          <form className="login-form" onSubmit={handleNext} autoComplete="off">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="off"
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
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
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
                  autoComplete="new-password"
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
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const dataUrl = await resizeImageFile(file, { maxEdge: 240, quality: 0.75 });
                        updateField('childPhoto', dataUrl);
                      } catch {
                        setError('Could not process that image — try a different photo.');
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
                <div className="form-group">
                  <label htmlFor="child-blood-type">Blood Type</label>
                  <select
                    id="child-blood-type"
                    value={form.childBloodType}
                    onChange={(e) => updateField('childBloodType', e.target.value)}
                    required
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="unknown">I don&apos;t know</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Does your child have any allergies?</label>
                  <div className="choice-selector">
                    <button
                      type="button"
                      className={`choice-option ${form.childHasAllergies === 'no' ? 'active no' : ''}`}
                      onClick={() => updateField('childHasAllergies', 'no')}
                      aria-pressed={form.childHasAllergies === 'no'}
                    >
                      <span className="choice-icon">✓</span>
                      <span>No allergies</span>
                    </button>
                    <button
                      type="button"
                      className={`choice-option ${form.childHasAllergies === 'yes' ? 'active yes' : ''}`}
                      onClick={() => updateField('childHasAllergies', 'yes')}
                      aria-pressed={form.childHasAllergies === 'yes'}
                    >
                      <span className="choice-icon">!</span>
                      <span>Yes, has allergies</span>
                    </button>
                  </div>
                </div>
                {form.childHasAllergies === 'yes' && (
                  <div className="form-group">
                    <label htmlFor="child-allergies">List allergies</label>
                    <input
                      id="child-allergies"
                      type="text"
                      value={form.childAllergies}
                      onChange={(e) => updateField('childAllergies', e.target.value)}
                      placeholder="e.g. Peanuts, Dairy, Pollen"
                      required
                    />
                  </div>
                )}
                {levelInfo && (
                  <div className="auto-assign-info">
                    <h4>Auto-Assigned Details</h4>
                    <div className="assign-grid">
                      <div className="assign-item">
                        <span className="assign-label">Age</span>
                        <span className="assign-value">{levelInfo.ageLabel}</span>
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

        {step === 1 && (
          <div className="login-footer">
            <p>Already have an account? <Link to="/">Sign In</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
