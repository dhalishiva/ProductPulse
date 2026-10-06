import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Info, Lock, LogOut, RefreshCw, Users } from "lucide-react";
import { useWorkspace } from "../state/Workspace";
import { format } from "../data/demo";
import type { Day } from "../data/demo";
import { Change, Empty, PageHeading, PeriodSelect } from "../components/UI";
import { TrafficChart } from "../components/Chart";
import {
  liveApi,
  SignedOutError,
  type BreakdownRow,
  type LiveDetail,
  type LiveOverview,
  type LiveProduct,
} from "../live/api";

type Auth = "checking" | "out" | "in";

export function Traffic() {
  const [auth, setAuth] = useState<Auth>("checking");
  const signedOut = useCallback(() => setAuth("out"), []);

  useEffect(() => {
    let active = true;
    liveApi
      .isSignedIn()
      .then((ok) => active && setAuth(ok ? "in" : "out"))
      .catch(() => active && setAuth("out"));
    return () => {
      active = false;
    };
  }, []);

  if (auth === "checking")
    return (
      <>
        <PageHeading
          title="Live traffic"
          description="Real Vercel Web Analytics for your products."
        />
        <p className="muted" role="status">
          Checking your session…
        </p>
      </>
    );
  if (auth === "out") return <SignIn onSignedIn={() => setAuth("in")} />;
  return <LiveTraffic onSignedOut={signedOut} />;
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passcode = String(new FormData(event.currentTarget).get("passcode") ?? "");
    setBusy(true);
    setError("");
    try {
      await liveApi.signIn(passcode);
      onSignedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Live traffic"
        description="Real Vercel Web Analytics for your products. Enter your passcode to continue."
      />
      <section className="panel live-signin">
        <form onSubmit={submit}>
          <label>
            Passcode
            <input
              name="passcode"
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
              autoFocus
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button className="button dark" type="submit" disabled={busy}>
              <Lock size={16} />
              <span>{busy ? "Checking…" : "Unlock"}</span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

const pctChange = (now: number, before: number) =>
  before ? (now / before - 1) * 100 : null;

function LiveTraffic({ onSignedOut }: { onSignedOut: () => void }) {
  const { period, notify } = useWorkspace();
  const [data, setData] = useState<LiveOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await liveApi.overview(period));
    } catch (e) {
      if (e instanceof SignedOutError) return onSignedOut();
      setError(e instanceof Error ? e.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [period, onSignedOut]);

  useEffect(() => {
    void load();
  }, [load]);

  const loaded = data?.projects.filter((p) => p.totals) ?? [];
  const failed = data?.projects.filter((p) => p.error) ?? [];
  const visitors = loaded.reduce((n, p) => n + (p.totals?.visitors ?? 0), 0);
  const pageviews = loaded.reduce((n, p) => n + (p.totals?.pageviews ?? 0), 0);
  const prevPageviews = loaded.reduce((n, p) => n + (p.previous?.pageviews ?? 0), 0);
  const change = pctChange(pageviews, prevPageviews);

  const days: Day[] = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const p of loaded)
      for (const d of p.daily ?? [])
        byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.visitors);
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vercel]) => ({
        date,
        label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        users: 0,
        previous: 0,
        clicks: 0,
        impressions: 0,
        events: 0,
        vercel,
      }));
  }, [data]);

  async function signOut() {
    await liveApi.signOut().catch(() => undefined);
    onSignedOut();
  }

  return (
    <>
      <PageHeading
        title="Live traffic"
        description="Real Vercel Web Analytics for your six products."
      >
        <PeriodSelect />
        <button className="button secondary" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} />
          <span>{loading ? "Loading…" : "Refresh"}</span>
        </button>
        <button className="button secondary" onClick={() => void signOut()}>
          <LogOut size={16} />
          <span>Lock</span>
        </button>
      </PageHeading>

      <div className="notice">
        <Info size={16} />
        <span>
          <strong>Live data.</strong> Production traffic from Vercel Web Analytics,
          in UTC. Visitors are unique within the selected range per site, so summing
          sites counts one person once per site. Today is included and may be partial.
        </span>
      </div>

      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {failed.length > 0 && (
        <div className="notice warning" role="status">
          <Info size={16} />
          <span>
            Couldn’t load {failed.map((p) => p.name).join(", ")}. The others are
            accurate; try Refresh in a moment.
          </span>
        </div>
      )}

      {!data && loading && (
        <p className="muted" role="status">
          Loading live analytics…
        </p>
      )}

      {data && (
        <>
          <div className="stats-grid live-stats">
            <section className="metric-card">
              <div className="metric-label">
                Visitors · summed across sites
                <Users size={17} />
              </div>
              <strong className="metric-value">{format(visitors)}</strong>
              <div className="metric-footer">
                <span>last {data.days} days</span>
              </div>
            </section>
            <section className="metric-card">
              <div className="metric-label">
                Page views
                <Eye size={17} />
              </div>
              <strong className="metric-value">{format(pageviews)}</strong>
              <div className="metric-footer">
                {change === null ? (
                  <span className="metric-hint">No previous data</span>
                ) : (
                  <>
                    <Change value={change} />
                    <span>vs. previous {data.days} days</span>
                  </>
                )}
              </div>
            </section>
          </div>

          <section className="panel traffic-panel">
            <div className="panel-heading">
              <div>
                <h2>Daily visitors, all sites</h2>
                <p>Sum of each site’s daily unique visitors.</p>
              </div>
            </div>
            {days.length > 1 ? (
              <TrafficChart data={days} metric="vercel" />
            ) : (
              <Empty title="No traffic yet">
                Nothing was recorded for this range.
              </Empty>
            )}
          </section>

          <section className="panel live-gap">
            <div className="panel-heading">
              <div>
                <h2>By product</h2>
                <p>Select a product to see its pages, sources, countries and devices.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Visitors</th>
                    <th>Page views</th>
                    <th>vs. previous</th>
                    <th>
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.map((p) => (
                    <Row
                      key={p.id}
                      p={p}
                      active={selected === p.id}
                      onToggle={() => setSelected(selected === p.id ? null : p.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {selected && (
            <Detail
              key={`${selected}-${period}`}
              project={data.projects.find((p) => p.id === selected)!}
              days={period}
              onSignedOut={onSignedOut}
              onError={notify}
            />
          )}
          <p className="muted live-updated">
            Updated {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </>
      )}
    </>
  );
}

function Row({
  p,
  active,
  onToggle,
}: {
  p: LiveProduct;
  active: boolean;
  onToggle: () => void;
}) {
  const change = p.totals ? pctChange(p.totals.pageviews, p.previous.pageviews) : null;
  return (
    <tr>
      <td>
        <div className="product-cell">
          <span
            className="product-icon"
            style={{ background: p.color + "18", color: p.color }}
          >
            {p.initials}
          </span>
          <div>
            <strong>{p.name}</strong>
            <small>{p.domain}</small>
          </div>
        </div>
      </td>
      {p.totals ? (
        <>
          <td>{format(p.totals.visitors)}</td>
          <td>{format(p.totals.pageviews)}</td>
          <td>
            {change === null ? <span className="muted">—</span> : <Change value={change} />}
          </td>
        </>
      ) : (
        <td colSpan={3}>
          <span className="muted">{p.error}</span>
        </td>
      )}
      <td>
        <button
          className="button secondary"
          onClick={onToggle}
          aria-expanded={active}
          disabled={!p.totals}
        >
          {active ? "Hide" : "Details"}
        </button>
      </td>
    </tr>
  );
}

function Detail({
  project,
  days,
  onSignedOut,
  onError,
}: {
  project: LiveProduct;
  days: 7 | 28 | 90;
  onSignedOut: () => void;
  onError: (message: string) => void;
}) {
  const [detail, setDetail] = useState<LiveDetail | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    liveApi
      .detail(project.id, days)
      .then((d) => active && setDetail(d))
      .catch((e) => {
        if (!active) return;
        if (e instanceof SignedOutError) return onSignedOut();
        setFailed(true);
        onError("Couldn’t load details for this product.");
      });
    return () => {
      active = false;
    };
  }, [project.id, days, onSignedOut, onError]);

  return (
    <section className="panel live-gap">
      <div className="panel-heading">
        <div>
          <h2>{project.name} · details</h2>
          <p>Last {days} days, by visitors.</p>
        </div>
      </div>
      {failed ? (
        <p className="form-error" role="alert">
          Couldn’t load details. Try again.
        </p>
      ) : !detail ? (
        <p className="muted" role="status">
          Loading…
        </p>
      ) : (
        <div className="live-breakdowns">
          <Breakdown title="Top pages" rows={detail.pages} />
          <Breakdown title="Referrers" rows={detail.referrers} />
          <Breakdown title="Countries" rows={detail.countries} />
          <Breakdown title="Devices" rows={detail.devices} />
        </div>
      )}
    </section>
  );
}

function Breakdown({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const max = Math.max(...rows.map((r) => r.visitors), 1);
  return (
    <div>
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="muted">No data</p>
      ) : (
        <ul className="bd-list">
          {rows.map((r) => (
            <li key={r.label}>
              <span className="bd-bar" style={{ width: `${(r.visitors / max) * 100}%` }} />
              <span className="bd-label" title={r.label}>
                {r.label}
              </span>
              <span className="bd-value">
                {format(r.visitors)}
                <small> · {format(r.pageviews)} views</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
