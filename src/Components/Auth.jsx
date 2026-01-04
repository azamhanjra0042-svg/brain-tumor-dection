import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Icons = {
  user: "👤",
  mail: "✉️",
  phone: "📱",
  lock: "🔒",
  scan: "🫁",
};

function Field({ icon, label, type = "text", value, onChange, error, right, name }) {
  const hasValue = String(value || "").length > 0;

  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <div className={`input ${hasValue ? "has-value" : ""}`}>
        <div className="input__icon" aria-hidden="true">{icon}</div>

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          autoComplete="off"
        />
        <label>{label}</label>

        {right ? <div className="input__right">{right}</div> : <div className="input__right" />}
      </div>

      {error ? <div className="error">{error}</div> : <div className="hint">.</div>}
    </div>
  );
}

export default function Auth({ defaultTab = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(defaultTab); // login | signup
  const [toast, setToast] = useState({ type: "", msg: "" });

  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);

  // login
  const [lUser, setLUser] = useState("");
  const [lPass, setLPass] = useState("");
  const [remember, setRemember] = useState(true);

  // signup
  const [sUser, setSUser] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sPass, setSPass] = useState("");
  const [sCPass, setSCPass] = useState("");

  const [loading, setLoading] = useState(false);

  // Keep tab in sync with route (/login or /signup)
  useEffect(() => {
    if (location.pathname === "/signup") setTab("signup");
    else if (location.pathname === "/login") setTab("login");
  }, [location.pathname]);

  const loginErrors = useMemo(() => {
    const e = {};
    if (!lUser.trim()) e.user = "Username or email is required.";
    if (!lPass) e.pass = "Password is required.";
    if (lUser.includes("@") && !emailRx.test(lUser.trim())) e.user = "Enter a valid email.";
    return e;
  }, [lUser, lPass]);

  const signupErrors = useMemo(() => {
    const e = {};
    if (!sUser.trim()) e.user = "Username is required.";
    if (!sEmail.trim()) e.email = "Email is required.";
    else if (!emailRx.test(sEmail.trim())) e.email = "Enter a valid email.";
    if (!sPhone.trim()) e.phone = "Phone is required.";
    else if (sPhone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number.";
    if (!sPass) e.pass = "Password is required.";
    else if (sPass.length < 6) e.pass = "Password must be at least 6 characters.";
    if (!sCPass) e.cpass = "Confirm password is required.";
    else if (sCPass !== sPass) e.cpass = "Passwords do not match.";
    return e;
  }, [sUser, sEmail, sPhone, sPass, sCPass]);

  const canSubmit =
    tab === "login"
      ? Object.keys(loginErrors).length === 0
      : Object.keys(signupErrors).length === 0;

  const clearToast = () => setToast({ type: "", msg: "" });

  // ✅ DEMO auth (replace with API later)
  const fakeAuth = async () => {
    setLoading(true);
    clearToast();
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);

    if (tab === "login") {
      // ✅ "Logged in"
      localStorage.setItem("lc_token", "demo_token_123");
      if (remember) localStorage.setItem("lc_remember", "1");
      else localStorage.removeItem("lc_remember");

      setToast({ type: "ok", msg: "Welcome back. Login successful." });

      // go dashboard
      navigate("/dashboard", { replace: true });
    } else {
      setToast({ type: "ok", msg: "Account created. You can login now." });

      // go login screen
      navigate("/login", { replace: true });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || loading) {
      setToast({ type: "bad", msg: "Please fix the highlighted fields." });
      return;
    }
    fakeAuth();
  };

  const goLogin = () => { clearToast(); navigate("/login"); };
  const goSignup = () => { clearToast(); navigate("/signup"); };

  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        <div className="grid" />
        <div className="orb orb--1" />
        <div className="orb orb--2" />
        <div className="orb orb--3" />
      </div>

      <div className="auth__wrap">
        <div className="brand">
          <div className="brand__logo">LC</div>
          <div>
            <div className="brand__title">LungCare AI</div>
            <div className="brand__sub">Premium detection • secure analysis • fast workflow</div>
          </div>
        </div>

        <div className="card">
          <div className="tabs">
            <div className={`tab__slider ${tab === "signup" ? "to-right" : ""}`} />
            <button
              className={`tab ${tab === "login" ? "is-active" : ""}`}
              onClick={goLogin}
              type="button"
            >
              Login
            </button>
            <button
              className={`tab ${tab === "signup" ? "is-active" : ""}`}
              onClick={goSignup}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {toast.msg ? (
            <div className={`toast ${toast.type === "ok" ? "toast--ok" : "toast--bad"}`}>
              {toast.msg}
            </div>
          ) : null}

          <form className="form" onSubmit={onSubmit}>
            {tab === "login" ? (
              <>
                <div className="form__head">
                  <h3 className="h2">Welcome back</h3>
                  <p className="p">Login with *username or email* and your password.</p>
                </div>

                <Field
                  icon={Icons.user}
                  label="Username or Email"
                  value={lUser}
                  onChange={(e) => setLUser(e.target.value)}
                  error={loginErrors.user}
                  name="login_user"
                />

                <Field
                  icon={Icons.lock}
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={lPass}
                  onChange={(e) => setLPass(e.target.value)}
                  error={loginErrors.pass}
                  name="login_pass"
                  right={
                    <button
                      type="button"
                      className="iconBtn"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      title={showPass ? "Hide" : "Show"}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  }
                />

                <div className="row row--between">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="link"
                    onClick={() => setToast({ type: "ok", msg: "Password reset flow goes here." })}
                  >
                    Forgot password?
                  </button>
                </div>

                <button className={`btn ${(!canSubmit || loading) ? "is-disabled" : ""}`} disabled={!canSubmit || loading}>
                  <span className="btn__shine" />
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="foot">
                  New here?{" "}
                  <button type="button" className="link" onClick={goSignup}>
                    Create an account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form__head">
                  <h3 className="h2">Create your account</h3>
                  <p className="p">Enter details to get started with LungCare AI.</p>
                </div>

                <div className="grid2">
                  <Field
                    icon={Icons.user}
                    label="Username"
                    value={sUser}
                    onChange={(e) => setSUser(e.target.value)}
                    error={signupErrors.user}
                    name="signup_user"
                  />
                  <Field
                    icon={Icons.phone}
                    label="Phone"
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    error={signupErrors.phone}
                    name="signup_phone"
                  />
                </div>

                <Field
                  icon={Icons.mail}
                  label="Email"
                  type="email"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  error={signupErrors.email}
                  name="signup_email"
                />

                <div className="grid2">
                  <Field
                    icon={Icons.lock}
                    label="Password"
                    type={showPass ? "text" : "password"}
                    value={sPass}
                    onChange={(e) => setSPass(e.target.value)}
                    error={signupErrors.pass}
                    name="signup_pass"
                    right={
                      <button
                        type="button"
                        className="iconBtn"
                        onClick={() => setShowPass((v) => !v)}
                        aria-label={showPass ? "Hide password" : "Show password"}
                        title={showPass ? "Hide" : "Show"}
                      >
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    }
                  />

                  <Field
                    icon={Icons.lock}
                    label="Confirm Password"
                    type={showCPass ? "text" : "password"}
                    value={sCPass}
                    onChange={(e) => setSCPass(e.target.value)}
                    error={signupErrors.cpass}
                    name="signup_cpass"
                    right={
                      <button
                        type="button"
                        className="iconBtn"
                        onClick={() => setShowCPass((v) => !v)}
                        aria-label={showCPass ? "Hide confirm password" : "Show confirm password"}
                        title={showCPass ? "Hide" : "Show"}
                      >
                        {showCPass ? "🙈" : "👁️"}
                      </button>
                    }
                  />
                </div>

                <button className={`btn ${(!canSubmit || loading) ? "is-disabled" : ""}`} disabled={!canSubmit || loading}>
                  <span className="btn__shine" />
                  {loading ? "Creating..." : "Sign Up"}
                </button>

                <div className="foot">
                  Already have an account?{" "}
                  <button type="button" className="link" onClick={goLogin}>
                    Login
                  </button>
                </div>

                <div className="note">By signing up, you agree to our Terms & Privacy.</div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
