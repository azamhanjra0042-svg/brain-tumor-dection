import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard-elite.css";

const prettyPct = (v) => `${Math.round(v * 100)}%`;

function Badge({ tone, children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export default function Dashboard() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);z

  // fake results (replace with your backend call later)
  const [result, setResult] = useState(null);

  const canAnalyze = useMemo(() => !!file && !loading, [file, loading]);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("lc_token");
    navigate("/login", { replace: true });
  };

  const onPick = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setResult(null);

    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      // Node API endpoint
      const res = await fetch("http://127.0.0.1:5001/api/predict", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Prediction failed");
      }

      // data is already in the format your UI expects:
      // { label, confidence, severity, classes[], notes[], meta{} }
      setResult({
        ...data,
        meta: {
          ...(data.meta || {}),
          input: data?.meta?.input || file?.name || "-",
          time: data?.meta?.time || "≈ 1s",
        },
      });
    } catch (err) {
      setResult({
        label: "Error",
        confidence: 0,
        severity: "High",
        classes: [],
        notes: [String(err.message || err)],
        meta: { model: "API", input: file?.name || "-", time: "-" },
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="dash">
      <button
        className="dBtn dBtn--ghost float-right"
        onClick={logout}
        type="button"
      >
        Logout
      </button>
      <div className="dash__bg" aria-hidden="true">
        <div className="dash__grid" />
        <div className="dash__orb dash__orb--1" />
        <div className="dash__orb dash__orb--2" />
      </div>
      <div className="dash__wrap">
        <header className="dash__top">
          <div className="dash__brand">
            <div className="dash__logo">LC</div>
            <div>
              <div className="dash__title">LungCare AI Dashboard</div>
              <div className="dash__sub">
                Upload CT image → Analyze → View prediction & confidence
              </div>
            </div>
          </div>

          <div className="dash__actions">
            <button className="dBtn dBtn--ghost" onClick={reset} type="button">
              Reset
            </button>
            <button
              className={`dBtn ${!canAnalyze ? "is-disabled" : ""}`}
              onClick={analyze}
              disabled={!canAnalyze}
              type="button"
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>
        </header>

        <div className="dash__grid2">
          {/* Upload Card */}
          <section className="panel">
            <div className="panel__head">
              <h3 className="h3">Upload Scan</h3>
              <p className="p2">
                PNG / JPG recommended. Use high quality CT scan image.
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              hidden
            />

            <div
              className={`drop ${preview ? "has-preview" : ""}`}
              onClick={onPick}
              role="button"
              tabIndex={0}
            >
              {!preview ? (
                <div className="drop__empty">
                  <div className="drop__icon">🩻</div>
                  <div className="drop__text">
                    <div className="drop__title">Click to upload</div>
                    <div className="drop__hint">or drag & drop (optional)</div>
                  </div>
                </div>
              ) : (
                <div className="drop__preview">
                  <img src={preview} alt="Preview" />
                  <div className="drop__overlay">
                    <div className="drop__name">{file?.name}</div>
                    <div className="drop__small">Click to replace</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mini">
              <div className="mini__row">
                <span className="mini__k">Status</span>
                <span className="mini__v">
                  {loading ? (
                    <Badge tone="info">Analyzing</Badge>
                  ) : file ? (
                    <Badge tone="ok">Ready</Badge>
                  ) : (
                    <Badge tone="muted">No file</Badge>
                  )}
                </span>
              </div>
              <div className="mini__row">
                <span className="mini__k">Module</span>
                <span className="mini__v">
                  <Badge tone="info">Segmentation + Prediction</Badge>
                </span>
              </div>
            </div>
          </section>

          {/* Results Card */}
          <section className="panel">
            <div className="panel__head">
              <h3 className="h3">Prediction Results</h3>
              <p className="p2">
                Confidence, class distribution, and guidance.
              </p>
            </div>

            {!result ? (
              <div className="emptyState">
                <div className="emptyState__icon">🫁</div>
                <div className="emptyState__title">No results yet</div>
                <div className="emptyState__sub">
                  Upload an image and click{" "}
                  <span className="chip">Analyze Image</span>.
                </div>
              </div>
            ) : (
              <>
                <div className="hero">
                  <div className="hero__left">
                    <div className="hero__label">{result.label}</div>
                    <div className="hero__meta">
                      <Badge tone={result.severity === "High" ? "bad" : "ok"}>
                        {result.severity} risk
                      </Badge>
                      <Badge tone="info">{result.meta.model}</Badge>
                    </div>
                  </div>

                  <div className="ring" aria-label="confidence ring">
                    <div className="ring__val">
                      {prettyPct(result.confidence)}
                    </div>
                    <div className="ring__cap">Confidence</div>
                  </div>
                </div>

                <div className="bars">
                  {result.classes.map((c) => (
                    <div key={c.name} className="bar">
                      <div className="bar__top">
                        <span className="bar__name">{c.name}</span>
                        <span className="bar__pct">{prettyPct(c.score)}</span>
                      </div>
                      <div className="bar__track">
                        <div
                          className="bar__fill"
                          style={{
                            width: `${Math.max(2, Math.round(c.score * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="metaBox">
                  <div className="metaBox__row">
                    <span>Input</span>
                    <span className="mono">{result.meta.input}</span>
                  </div>
                  <div className="metaBox__row">
                    <span>Runtime</span>
                    <span className="mono">{result.meta.time}</span>
                  </div>
                </div>

                <div className="notes">
                  <div className="notes__title">Notes</div>
                  <ul>
                    {result.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="dash__foot">
          © {new Date().getFullYear()} LungCare AI • Secure • Audit-ready •
          Clinical workflow UI
        </footer>
      </div>
    </div>
  );
}
