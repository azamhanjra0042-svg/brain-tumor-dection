import { useMemo, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const pct = (v) => `${Math.round(v * 1000) / 10}%`;

export default function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const canAnalyze = useMemo(() => file && !loading, [file, loading]);

  const pick = () => inputRef.current?.click();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file); // ✅ backend expects "file"

      const res = await fetch(`${API}/predict`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.detail || "Prediction failed");
      }

      // ✅ backend returns { ok, prediction, confidence, probabilities }
      setResult(data);
    } catch (e) {
      setError(e?.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  // convert probabilities object -> sorted array
  const top = result?.probabilities
    ? Object.entries(result.probabilities)
        .map(([cls, prob]) => ({ cls, prob }))
        .sort((a, b) => b.prob - a.prob)
    : [];

  return (
    <div className="page">
      <header className="header">
        <h1>🧠 Brain Tumor Detection</h1>
        <p>AI-powered MRI Classification</p>
      </header>

      <main className="grid">
        <section className="card">
          <h3>Upload MRI Image</h3>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFile}
          />

          {!preview ? (
            <button className="btn" onClick={pick}>Select Image</button>
          ) : (
            <>
              <img src={preview} className="preview" alt="preview" />
              <button className="btn" onClick={pick}>Change</button>
            </>
          )}

          <button
            className="btn primary"
            disabled={!canAnalyze}
            onClick={analyze}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && <div className="error">{error}</div>}
        </section>

        <section className="card">
          <h3>Results</h3>

          {!result ? (
            <p className="muted">Upload image to see results</p>
          ) : (
            <>
              <div className="result-main">
                <h2>{result.prediction}</h2>
                <span>{pct(result.confidence)}</span>
              </div>

              {top.map((t) => (
                <div className="bar" key={t.cls}>
                  <span>{t.cls}</span>
                  <span>{pct(t.prob)}</span>
                </div>
              ))}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
