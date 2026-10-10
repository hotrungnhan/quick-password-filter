import { useCallback, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileUp,
  Flag,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  exportCsv,
  parseCsv,
  readSession,
  STORAGE_KEY,
  website,
  type Session,
  type Status,
} from "./data";
import ReviewControls from "./ReviewControls";
import { useReviewKeyboard } from "./useReviewKeyboard";

type Screen = "home" | "import" | "review" | "export";
export default function App() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [screen, setScreen] = useState<Screen>("home");
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [drag, setDrag] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const total = session?.entries.length ?? 0;
  const important =
    session?.entries.filter((e) => e.status === "important").length ?? 0;
  const unimportant =
    session?.entries.filter((e) => e.status === "unimportant").length ?? 0;
  const remaining = total - important - unimportant;
  const progress = total ? Math.round(((total - remaining) / total) * 100) : 0;
  const current = session?.entries.find((e) => e.status === null);
  const persist = useCallback((next: Session | null) => {
    try {
      next
        ? localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        : localStorage.removeItem(STORAGE_KEY);
      setSession(next);
      setError("");
      return true;
    } catch {
      setError(
        "Could not save locally. Your browser storage may be full or disabled. Free some space and try again.",
      );
      return false;
    }
  }, []);
  const flag = useCallback(
    (status: Exclude<Status, null>) => {
      if (!session || !current) return;
      persist({
        ...session,
        entries: session.entries.map((e) =>
          e.id === current.id ? { ...e, status } : e,
        ),
        history: [...session.history, current.id],
      });
      setRevealed(false);
      setDrag(0);
    },
    [session, current, persist],
  );
  const undo = useCallback(() => {
    if (!session || !session.history.length) return;
    const id = session.history.at(-1);
    persist({
      ...session,
      entries: session.entries.map((e) =>
        e.id === id ? { ...e, status: null } : e,
      ),
      history: session.history.slice(0, -1),
    });
    setRevealed(false);
    setDrag(0);
  }, [session, persist]);
  useReviewKeyboard({
    enabled: screen === "review" && !reset,
    onFlag: flag,
    onUndo: undo,
  });
  const swipe = useSwipeable({
    onSwiping: (e) => setDrag(Math.max(-130, Math.min(130, e.deltaX))),
    onSwipedLeft: () => flag("unimportant"),
    onSwipedRight: () => flag("important"),
    onTouchEndOrOnMouseUp: () => setDrag(0),
    delta: 65,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });
  async function importFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Please choose a CSV smaller than 10 MB.");
      const next = parseCsv(await file.text(), file.name);
      if (persist(next)) setScreen("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this file.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  function download(status: "important" | "unimportant") {
    if (!session) return;
    const url = URL.createObjectURL(
      new Blob([exportCsv(session, status)], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `passwords-${status}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className={`app-shell screen-${screen}`}>
      <header className="flex items-center justify-between">
        <button
          className="brand flex items-center gap-2"
          onClick={() => setScreen("home")}
          aria-label="Passwise home"
        >
          <span className="brand-icon">
            <KeyRound size={20} />
          </span>
          passwise<span className="brand-dot">.</span>
        </button>
        <span className="local-badge">
          <span /> LOCAL ONLY
        </span>
      </header>
      <main>
        {screen !== "home" && (
          <button
            className="back"
            onClick={() => {
              setScreen("home");
              setError("");
            }}
          >
            <ArrowLeft size={16} /> Back to overview
          </button>
        )}
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {screen === "home" && (
          <>
            <div className="eyebrow">
              <span /> A LITTLE DIGITAL DECLUTTER
            </div>
            <h1>
              Less clutter.
              <br />
              More <span>peace of mind.</span>
            </h1>
            <p className="intro">
              Give your saved passwords a fresh start.
              <br />
              One swipe, one decision at a time.
            </p>
            <section className="overview">
              <div className="flex items-center justify-between">
                <span className="section-label">YOUR PASSWORD SPACE</span>
                <LockKeyhole size={16} className="muted" />
              </div>
              <div className="total">
                <strong>{total.toLocaleString()}</strong>
                <span>saved passwords</span>
              </div>
              <div className="stats">
                <div>
                  <span className="stat-icon green">
                    <Flag size={17} />
                  </span>
                  <strong>{important}</strong>
                  <small>Important</small>
                </div>
                <div>
                  <span className="stat-icon gray">
                    <X size={17} />
                  </span>
                  <strong>{unimportant}</strong>
                  <small>Unimportant</small>
                </div>
                <div>
                  <span className="stat-icon amber">
                    <Sparkles size={17} />
                  </span>
                  <strong>{remaining}</strong>
                  <small>To review</small>
                </div>
              </div>
              <div className="flex justify-between progress-label">
                <span>Your cleanup progress</span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: `${progress}%` }} />
              </div>
              <p className="card-note">
                {total
                  ? remaining
                    ? "A clearer password collection is a few swipes away."
                    : "All sorted. Your password space feels lighter."
                  : "Import your passwords to begin your cleanup."}
              </p>
            </section>
            <button
              className="primary"
              onClick={() =>
                setScreen(total ? (remaining ? "review" : "export") : "import")
              }
            >
              {total
                ? remaining
                  ? "Continue reviewing"
                  : "Export your results"
                : "Import passwords"}
              <ArrowRight size={20} />
            </button>
            <div className="action-grid">
              <button disabled={!total} onClick={() => setScreen("export")}>
                <Download size={19} />
                <span>Export results</span>
              </button>
              <button
                onClick={() => (total ? setReset(true) : setScreen("import"))}
              >
                <RotateCcw size={19} />
                <span>Start from scratch</span>
              </button>
            </div>
            <div className="how">
              <span className="section-label">
                SMALL SWIPES. BIG DIFFERENCE.
              </span>
              <div className="flex gap-4 items-start mt-5">
                <span className="how-icon">
                  <ArrowRight size={22} />
                </span>
                <div>
                  <h3>Keep what matters</h3>
                  <p>
                    Swipe right for important, left for the rest.
                    <br />
                    Prefer buttons? We've got those too.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {screen === "import" && (
          <>
            <div className="eyebrow">STEP 01 / BRING YOUR PASSWORDS</div>
            <h1>
              A fresh start
              <br />
              begins <span>here.</span>
            </h1>
            <p className="intro">
              Import your Chrome password CSV.
              <br />
              Your file stays on this device.
            </p>
            <input
              ref={input}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
            <button
              className="upload"
              disabled={busy}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy) void importFile(e.dataTransfer.files[0]);
              }}
              onClick={() => input.current?.click()}
            >
              <span className="upload-icon">
                <FileUp size={30} />
              </span>
              <h2>{busy ? "Reading your file…" : "Drop the clutter here"}</h2>
              <p>Choose your Chrome password CSV</p>
              <span className="upload-cta">
                Choose file <ArrowRight size={16} />
              </span>
              <small>CSV files · up to 10 MB</small>
            </button>
            <section className="instructions">
              <h3>Get your file from Chrome</h3>
              <ol>
                <li>Open Chrome’s Google Password Manager.</li>
                <li>Go to Settings → Export passwords.</li>
                <li>Save the CSV, then choose it above.</li>
              </ol>
            </section>
            <p className="privacy-note">
              <ShieldCheck size={18} /> Password CSVs contain readable
              passwords. Local browser storage and exported files are not
              encrypted.
            </p>
          </>
        )}
        {screen === "review" && (
          <>
            <div className="flex justify-between items-center">
              <div className="eyebrow">STEP 02 / MAKE SOME SPACE</div>
              <span className="counter">
                {total - remaining} / {total}
              </span>
            </div>
            <h1>
              Keep the <span>keepers.</span>
            </h1>
            <p className="intro">Does this account still matter to you?</p>
            <div className="progress-track review-progress">
              <div style={{ width: `${progress}%` }} />
            </div>
            {current ? (
              <>
                <article
                  {...swipe}
                  className={`password-card ${drag > 40 ? "keep" : drag < -40 ? "discard" : ""}`}
                  style={{
                    transform: `translateX(${drag}px) rotate(${drag / 18}deg)`,
                  }}
                  key={current.id}
                >
                  <div className="site-avatar">
                    {website(current.values.url).slice(0, 1).toUpperCase()}
                  </div>
                  <span className="section-label">SAVED ACCOUNT</span>
                  <h2>{current.values.name || website(current.values.url)}</h2>
                  <p className="site-url">{current.values.url}</p>
                  <div className="account-field">
                    <label>USERNAME</label>
                    <p>{current.values.username || "No username"}</p>
                  </div>
                  <div className="account-field">
                    <label>PASSWORD</label>
                    <div className="flex justify-between items-center">
                      <p className="password-value">
                        {revealed ? current.values.password : "••••••••••••"}
                      </p>
                      <button
                        aria-label={
                          revealed ? "Hide password" : "Show password"
                        }
                        onClick={() => setRevealed(!revealed)}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {revealed ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>
                  {drag !== 0 && (
                    <span
                      className={`swipe-stamp ${drag > 0 ? "right" : "left"}`}
                    >
                      {drag > 0 ? "IMPORTANT" : "UNIMPORTANT"}
                    </span>
                  )}
                </article>
                <div className="swipe-hint">
                  <span>← Unimportant</span>
                  <span>Important →</span>
                </div>
              </>
            ) : (
              <section className="complete">
                <span className="upload-icon">
                  <Check size={32} />
                </span>
                <h2>All clear. Nicely done.</h2>
                <p>
                  Every password has a place.
                  <br />
                  Your two lists are ready to download.
                </p>
                <button className="primary" onClick={() => setScreen("export")}>
                  Export results
                  <Download size={19} />
                </button>
              </section>
            )}
            <ReviewControls
              canFlag={!!current}
              canUndo={!!session?.history.length}
              onFlag={flag}
              onUndo={undo}
            />
          </>
        )}
        {screen === "export" && (
          <>
            <div className="eyebrow">STEP 03 / TAKE YOUR LISTS</div>
            <h1>
              Sorted.
              <br />
              <span>Ready to go.</span>
            </h1>
            <p className="intro">
              Two tidy lists. Download what you need.
              <br />
              Original Chrome CSV columns are preserved.
            </p>
            <div className="export-list">
              {(["important", "unimportant"] as const).map((status) => (
                <section key={status}>
                  <span
                    className={`stat-icon ${status === "important" ? "green" : "gray"}`}
                  >
                    {status === "important" ? (
                      <Flag size={22} />
                    ) : (
                      <X size={22} />
                    )}
                  </span>
                  <div>
                    <h3>
                      {status === "important" ? "Important" : "Unimportant"}
                    </h3>
                    <p>
                      {status === "important" ? important : unimportant}{" "}
                      passwords
                    </p>
                  </div>
                  <button
                    aria-label={`Download ${status} CSV`}
                    disabled={
                      !(status === "important" ? important : unimportant)
                    }
                    onClick={() => download(status)}
                  >
                    <Download size={22} />
                  </button>
                </section>
              ))}
            </div>
            {remaining > 0 && (
              <div className="remaining-note">
                <p>
                  {remaining} passwords still need a decision. They are excluded
                  from these exports.
                </p>
                <button onClick={() => setScreen("review")}>
                  Continue reviewing <ChevronRight size={16} />
                </button>
              </div>
            )}
            <p className="privacy-note">
              <LockKeyhole size={19} /> Downloads include passwords in plain
              text. Keep the files somewhere private.
            </p>
          </>
        )}
      </main>
      <footer>
        <ShieldCheck size={15} />
        <span>On your device. In your control.</span>
        <span className="footer-dot">•</span>
        <span>No uploads</span>
      </footer>
      {reset && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="modal"
          >
            <h2 id="reset-title">Start fresh?</h2>
            <p>
              This removes your imported passwords and review progress from this
              browser. Export your results first if you want to keep them.
            </p>
            <button
              className="primary"
              onClick={() => {
                if (persist(null)) {
                  setReset(false);
                  setScreen("import");
                }
              }}
            >
              Clear data & start fresh
              <RotateCcw size={18} />
            </button>
            <button className="undo" onClick={() => setReset(false)}>
              Keep my progress
            </button>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
