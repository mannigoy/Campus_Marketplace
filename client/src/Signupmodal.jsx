import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./styles/Signup.css";

const API = "http://localhost:8080/api/auth";

// Step 1: Enter CIT-U Email + Password
function StepEmail({ onNext }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 10,
    letter: /[A-Za-z]/.test(form.password),
    number: /\d/.test(form.password),
  };
  const isPasswordValid =
    passwordChecks.length && passwordChecks.letter && passwordChecks.number;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSend = async () => {
    if (!form.email.endsWith("@cit.edu")) {
      setError("Only @cit.edu emails are allowed.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must meet all requirements below.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onNext(form.email);
    } catch {
      setError("Cannot reach server. Is Spring Boot running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-title">Create an account</div>
      <div className="modal-subtitle">Enter your email and password to get started</div>

      <div className="info-box">
        Use your <strong>@cit.edu email</strong>. A 6-digit code will be sent to your inbox.
      </div>

      {error && <div className="msg-error">⚠ {error}</div>}

      <div className="form-group">
        <label className="form-label">CIT-U Email</label>
        <input
          className="form-input"
          type="email"
          name="email"
          placeholder="yourname@cit.edu"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={handleChange}
        />
        <div className="password-rules">
          <div className={`password-rule ${passwordChecks.length ? "met" : ""}`}>
            <span className="password-rule-icon" aria-hidden="true">
              {passwordChecks.length ? "✓" : "x"}
            </span>
            <span>At least 10 characters</span>
          </div>
          <div className={`password-rule ${passwordChecks.letter ? "met" : ""}`}>
            <span className="password-rule-icon" aria-hidden="true">
              {passwordChecks.letter ? "✓" : "x"}
            </span>
            <span>At least 1 letter</span>
          </div>
          <div className={`password-rule ${passwordChecks.number ? "met" : ""}`}>
            <span className="password-rule-icon" aria-hidden="true">
              {passwordChecks.number ? "✓" : "x"}
            </span>
            <span>At least 1 number</span>
          </div>
        </div>
      </div>

      <button className="btn-submit" onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send Verification Code"}
      </button>
    </>
  );
}

// Step 1b: Enter OTP
function StepOtp({ email, onNext, onBack }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      onNext(data);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-title">Check your email</div>
      <div className="modal-subtitle">We sent a 6-digit code to <strong>{email}</strong></div>

      {error && <div className="msg-error">⚠ {error}</div>}

      <div className="form-group">
        <label className="form-label">Verification Code</label>
        <input
          className="form-input"
          style={{ textAlign: "center", letterSpacing: "0.25rem", fontSize: "1.1rem" }}
          type="text"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={e => { setCode(e.target.value); setError(""); }}
        />
      </div>

      <button className="btn-submit" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify Code"}
      </button>
      <button className="btn-outline" onClick={onBack}>Back</button>
    </>
  );
}

// Step 2: Choose Username
function StepUsername({ token, onNext, onBack }) {
  const [form, setForm] = useState({ username: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = async () => {
    if (!form.username) { setError("Please fill in username."); return; }
    if (form.username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (/\s/.test(form.username)) { setError("Username cannot contain spaces."); return; }

    setLoading(true);
    try {
      const tokenToUse = token;
      const res = await fetch(`${API}/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToUse, username: form.username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onNext(form.username);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-title">Choose your username</div>
      <div className="modal-subtitle">This will be your public display name on Campus Marketplace</div>

      {error && <div className="msg-error">⚠ {error}</div>}

      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          className="form-input"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="e.g. juan_dela_cruz"
        />
      </div>

      <button className="btn-submit" onClick={handleNext} disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </button>
      <button className="btn-outline" onClick={onBack}>Back</button>
    </>
  );
}

// Step 3: Accept Terms
function StepTerms({ onFinish, onBack }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleFinish = () => {
    if (!agreed) { setError("You must accept the Terms & Conditions to proceed."); return; }
    onFinish();
  };

  return (
    <>
      <div className="modal-title">Terms & Conditions</div>
      <div className="modal-subtitle">Please read and accept before continuing</div>

      {error && <div className="msg-error">⚠ {error}</div>}

      <div className="terms-text">
        <strong>Campus Marketplace Terms of Service</strong>
        <br /><br />
        By creating an account, you agree to use Campus Marketplace solely for
        legitimate transactions within the CIT-U community. You must not post
        fraudulent listings, misrepresent products, or engage in any activity
        that violates school policy or applicable law.
        <br /><br />
        <strong>Privacy Policy</strong>
        <br /><br />
        We collect your name, email, and username to operate your account. Your
        data is never sold to third parties. You may request account deletion at
        any time by contacting campus support.
        <br /><br />
        <strong>Community Guidelines</strong>
        <br /><br />
        Treat all buyers and sellers with respect. Any form of harassment, hate
        speech, or dishonest dealing will result in immediate account suspension.
      </div>

      <label className="check-row" onClick={() => { setAgreed(!agreed); setError(""); }}>
        <input type="checkbox" className="check-input" checked={agreed} onChange={() => {}} />
        <span>I have read and agree to the <span className="text-maroon">Terms & Conditions</span> and <span className="text-maroon">Privacy Policy</span>.</span>
      </label>

      <button className="btn-submit" disabled={!agreed} onClick={handleFinish}>
        Create Account
      </button>
      <button className="btn-outline" onClick={onBack}>Back</button>
    </>
  );
}

// Main Modal
export default function SignUpModal({
  isOpen,
  mode = "signup",
  onClose,
  onSwitchToSignIn,
  onSwitchToSignUp,
}) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("CUSTOMER");
  const [isApprovedSeller, setIsApprovedSeller] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("NONE");
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setEmail("");
    setDone(false);
    setToken("");
    setUsername("");
    setUserRole("CUSTOMER");
    setIsApprovedSeller(false);
    setApplicationStatus("NONE");
    setSignInForm({ email: "", password: "" });
    setSignInError("");
    setSignInLoading(false);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setStep(0);
    setEmail("");
    setDone(false);
    setToken("");
    setUsername("");
    setUserRole("CUSTOMER");
    setIsApprovedSeller(false);
    setApplicationStatus("NONE");
    setSignInForm({ email: "", password: "" });
    setSignInError("");
    setSignInLoading(false);
    onClose();
  };

  const handleSignInChange = (e) => {
    setSignInForm({ ...signInForm, [e.target.name]: e.target.value });
    setSignInError("");
  };

  const handleSignIn = async () => {
    if (!signInForm.email || !signInForm.password) {
      setSignInError("Please enter both email and password.");
      return;
    }

    setSignInLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInForm.email,
          password: signInForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const raw = data.error || "";
        const isInvalidCreds = raw.toLowerCase().includes("invalid email or password");
        const errMsg = isInvalidCreds
          ? "Invalid email or password. Tip: check your password meets the requirements below or reset it."
          : raw || "Login failed.";
        setSignInError(errMsg);
        return;
      }

      const userRes = await fetch(`${API}/current-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setSignInError(userData.error || "Failed to load user info.");
        return;
      }

      login(
        {
          email: userData.email,
          username: userData.username,
          role: userData.role,
          isApprovedSeller: userData.isApprovedSeller,
          applicationStatus: userData.applicationStatus,
          id: userData.id,
        },
        data.token
      );
      handleClose();
      navigate("/dashboard");
    } catch (err) {
      setSignInError("Cannot reach server. Is Spring Boot running?");
    } finally {
      setSignInLoading(false);
    }
  };

  const signInPasswordChecks = {
    length: signInForm.password.length >= 10,
    letter: /[A-Za-z]/.test(signInForm.password),
    number: /\d/.test(signInForm.password),
  };

  const stepLabels = ["Email", "Verify", "Username", "Terms"];

  const StepBar = () => (
    <div className="step-bar">
      {stepLabels.map((label, i) => {
        const stateClass = i < step ? "done" : i === step ? "active" : "";
        return (
          <div key={i} className="step-wrapper">
            <div className="step-item">
              <div className={`step-circle ${stateClass}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`step-label ${stateClass}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`step-connector ${i < step ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={handleClose}>✕</button>

        <div className="modal-logo">
          <div className="modal-logo-title">Campus Marketplace</div>
          <div className="modal-logo-sub">CIT-U's official school merchandise store</div>
        </div>

        {mode === "signin" ? (
          <>
            <div className="modal-title">Sign In</div>
            <div className="modal-subtitle">Enter your email and password to continue</div>

            {signInError && <div className="msg-error">⚠ {signInError}</div>}

            <div className="form-group">
              <label className="form-label">CIT-U Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="yourname@cit.edu"
                value={signInForm.email}
                onChange={handleSignInChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={signInForm.password}
                onChange={handleSignInChange}
              />
              <div className="password-rules">
                <div className={`password-rule ${signInPasswordChecks.length ? "met" : ""}`}>
                  <span className="password-rule-icon" aria-hidden="true">
                    {signInPasswordChecks.length ? "✓" : "x"}
                  </span>
                  <span>At least 10 characters</span>
                </div>
                <div className={`password-rule ${signInPasswordChecks.letter ? "met" : ""}`}>
                  <span className="password-rule-icon" aria-hidden="true">
                    {signInPasswordChecks.letter ? "✓" : "x"}
                  </span>
                  <span>At least 1 letter</span>
                </div>
                <div className={`password-rule ${signInPasswordChecks.number ? "met" : ""}`}>
                  <span className="password-rule-icon" aria-hidden="true">
                    {signInPasswordChecks.number ? "✓" : "x"}
                  </span>
                  <span>At least 1 number</span>
                </div>
              </div>
            </div>

            <button className="btn-submit" onClick={handleSignIn} disabled={signInLoading}>
              {signInLoading ? "Signing in..." : "Sign In"}
            </button>

            <button className="btn-outline" onClick={onSwitchToSignUp}>
              Create account
            </button>
          </>
        ) : (
          <>
            {!done && <StepBar />}

            {done ? (
              <div className="text-center py-3">
                <div className="modal-emoji">🎉</div>
                <div className="modal-title">Account Created!</div>
                <div className="modal-subtitle mb-4">
                  Welcome to Campus Marketplace. You're all set!
                </div>
                <div className="msg-success">✓ Your account has been successfully created.</div>
                <button className="btn-submit" onClick={() => {
                  // Login the user
                  login(
                    {
                      email,
                      username,
                      role: userRole,
                      isApprovedSeller,
                      applicationStatus,
                    },
                    token
                  );
                  handleClose();
                  navigate("/dashboard");
                }}>
                  Get Started
                </button>
              </div>
            ) : step === 0 ? (
              <>
                <StepEmail onNext={(e) => { setEmail(e); setStep(1); }} />
                <button className="btn-outline" onClick={onSwitchToSignIn}>
                  Already have an account? Sign in
                </button>
              </>
            ) : step === 1 ? (
              <StepOtp
                email={email}
                onNext={(data) => {
                  setToken(data.token);
                  if (data.role) setUserRole(data.role);
                  if (data.isApprovedSeller !== undefined) {
                    setIsApprovedSeller(data.isApprovedSeller);
                  }
                  if (data.applicationStatus) {
                    setApplicationStatus(data.applicationStatus);
                  }
                  if (data.hasUsername) setDone(true); 
                  else setStep(2);              
                }}
                onBack={() => setStep(0)}
              />
            ) : step === 2 ? (
              <StepUsername 
                token={token}
                onNext={(savedUsername) => {
                  setUsername(savedUsername);
                  setStep(3);
                }} 
                onBack={() => setStep(1)} 
              />
            ) : (
              <StepTerms 
                onFinish={() => setDone(true)} 
                onBack={() => setStep(2)} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}