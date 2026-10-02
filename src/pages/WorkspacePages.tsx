import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Info,
  Lightbulb,
  Mail,
  ShieldCheck,
  Sparkles,
  Unplug,
  TrendingDown,
  Trophy,
  RotateCcw,
  LockKeyhole,
  Layers3,
} from "lucide-react";
import { useWorkspace } from "../state/Workspace";
import {
  Empty,
  Modal,
  PageHeading,
  PeriodSelect,
  ProviderIcon,
  ProductIcon,
} from "../components/UI";
import { format, series, summary } from "../data/demo";
import { providers, plans, type Provider } from "../domain/types";
import { TrafficChart } from "../components/Chart";
export function Acquisition() {
  const { data, period } = useWorkspace();
  const [selected, setSelected] = useState("all");
  const products = data.products.filter(
    (p) => selected === "all" || p.id === selected,
  );
  const ga = products.filter((p) =>
    data.connections.some(
      (c) => c.productId === p.id && c.provider === "ga4" && c.connected,
    ),
  );
  const gsc = products.filter((p) =>
    data.connections.some(
      (c) => c.productId === p.id && c.provider === "gsc" && c.connected,
    ),
  );
  const m = summary(ga, period),
    s = summary(gsc, period);
  const channels = [
    { name: "Organic search", pct: 42, color: "#344d42" },
    { name: "Direct", pct: 28, color: "#7b9e7e" },
    { name: "Referral", pct: 18, color: "#a9c198" },
    { name: "Organic social", pct: 12, color: "#d5e1bc" },
  ];
  return (
    <>
      <PageHeading
        title="Know where the momentum starts."
        description="From a search result to a first visit. Follow the paths to your products."
      >
        <label>
          <span className="sr-only">Filter by product</span>
          <select
            aria-label="Filter by product"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="all">All products</option>
            {data.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <PeriodSelect />
      </PageHeading>
      <div className="notice">
        <Info size={17} />
        Illustrative channel and query breakdowns. Search clicks and on-site
        users are different measures.
      </div>
      <div className="acquisition-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Where visitors find you</h2>
              <p>GA4 acquisition · sample distribution</p>
            </div>
            <ProviderIcon provider="ga4" />
          </div>
          {ga.length ? (
            <div className="channel-content">
              <div
                className="donut"
                style={{
                  background:
                    "conic-gradient(#344d42 0% 42%, #7b9e7e 42% 70%, #a9c198 70% 88%, #d5e1bc 88% 100%)",
                }}
              >
                <div>
                  <strong>{format(m.users)}</strong>
                  <span>daily users, summed</span>
                </div>
              </div>
              <div className="channels">
                {channels.map((c, i) => {
                  const others = channels
                    .slice(0, -1)
                    .reduce(
                      (a, c) => a + Math.floor((m.users * c.pct) / 100),
                      0,
                    );
                  return (
                    <div key={c.name}>
                      <span>
                        <i style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <strong>
                        {format(
                          i === 3
                            ? m.users - others
                            : Math.floor((m.users * c.pct) / 100),
                        )}
                      </strong>
                      <small>{c.pct}%</small>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Empty title="No GA4 sources connected">
              Connect a demo source to see acquisition data.
            </Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Your search footprint</h2>
              <p>Google Search Console</p>
            </div>
            <ProviderIcon provider="gsc" />
          </div>
          <div className="search-stats">
            <div>
              <strong>{format(s.clicks)}</strong>
              <small>Search clicks</small>
            </div>
            <div>
              <strong>{format(s.impressions)}</strong>
              <small>Impressions</small>
            </div>
            <div>
              <strong>
                {s.impressions
                  ? ((s.clicks / s.impressions) * 100).toFixed(2)
                  : "0"}
                %
              </strong>
              <small>Click-through rate</small>
            </div>
          </div>
          {gsc.length ? (
            <TrafficChart data={series(gsc, period)} metric="clicks" mini />
          ) : (
            <Empty title="No search data">
              Connect a Search Console demo source.
            </Empty>
          )}
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Queries worth a closer look</h2>
            <p>Sample search terms for connected products</p>
          </div>
          <span className="subtle-badge">Illustrative query subset</span>
        </div>
        {gsc.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Search query</th>
                  <th>Product</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
                  <th>CTR</th>
                  <th>Avg. position</th>
                </tr>
              </thead>
              <tbody>
                {gsc.flatMap((p) =>
                  [
                    `${p.name.toLowerCase()} software`,
                    `${p.name.toLowerCase()} alternatives`,
                  ].map((q, i) => {
                    const sm = summary([p], period);
                    const clicks = Math.round(sm.clicks * (i ? 0.12 : 0.28)),
                      impressions = Math.round(
                        sm.impressions * (i ? 0.15 : 0.23),
                      );
                    return (
                      <tr key={q}>
                        <td>
                          <strong>{q}</strong>
                        </td>
                        <td>{p.name}</td>
                        <td>{format(clicks)}</td>
                        <td>{format(impressions)}</td>
                        <td>
                          {impressions
                            ? ((clicks / impressions) * 100).toFixed(2)
                            : "0"}
                          %
                        </td>
                        <td>{i ? "14.8" : "6.2"}</td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No connected search properties">
            Try a different product or connect a demo source.
          </Empty>
        )}
      </section>
    </>
  );
}
export function Alerts() {
  const { data, markRead } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const visible = data.alerts.filter(
    (a) =>
      filter === "all" || (filter === "unread" ? !a.read : a.type === filter),
  );
  const unread = data.alerts.filter((a) => !a.read).length;
  return (
    <>
      <PageHeading
        title="A little signal. Less noise."
        description="The changes and small wins worth your attention."
      >
        <button
          className="button secondary"
          disabled={!unread}
          onClick={() => markRead()}
        >
          <CheckCheck size={16} />
          Mark all read
        </button>
      </PageHeading>
      <div className="notice">
        <Sparkles size={17} />
        These are sample insights. Live detection and email delivery are not
        enabled.
      </div>
      <div className="alert-tabs" role="group" aria-label="Filter insights">
        {[
          ["all", "All insights"],
          ["unread", `Unread (${unread})`],
          ["opportunity", "Opportunities"],
          ["attention", "Needs attention"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="alert-list">
        {visible.map((a) => {
          const p = data.products.find((p) => p.id === a.productId);
          const Icon =
            a.type === "opportunity"
              ? Lightbulb
              : a.type === "attention"
                ? TrendingDown
                : Trophy;
          return (
            <article
              key={a.id}
              className={`alert-card ${a.read ? "is-read" : ""}`}
            >
              <div className={`alert-icon ${a.type}`}>
                <Icon size={22} />
              </div>
              <div className="alert-body">
                <div className="alert-meta">
                  <span>
                    {a.type === "opportunity"
                      ? "OPPORTUNITY"
                      : a.type === "attention"
                        ? "NEEDS ATTENTION"
                        : "MILESTONE"}
                  </span>
                  <span>Sample insight</span>
                  {!a.read && <span className="unread-dot" />}
                </div>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <Link to={`/app/products/${a.productId}`}>
                  {p?.name ?? "View product"}
                  <ChevronRight size={14} />
                </Link>
              </div>
              <button
                className="icon-button"
                disabled={a.read}
                aria-label={`Mark ${a.title} as read`}
                onClick={() => markRead(a.id)}
              >
                <Check size={18} />
              </button>
            </article>
          );
        })}
        {!visible.length && (
          <Empty title="You’re all caught up">
            No insights match this filter. Time to get back to building.
          </Empty>
        )}
      </div>
      <div className="digest-banner">
        <Mail size={25} />
        <div>
          <h3>Your next check-in, delivered.</h3>
          <p>
            Set your briefing preferences now. Delivery will be available with
            live integrations.
          </p>
        </div>
        <Link to="/app/settings" className="button secondary">
          Briefing settings
        </Link>
      </div>
    </>
  );
}
export function Integrations() {
  const { data, toggleConnection } = useWorkspace();
  const [selected, setSelected] = useState("all");
  const products = data.products.filter(
    (p) => selected === "all" || selected === p.id,
  );
  return (
    <>
      <PageHeading
        title="Your tools. Finally together."
        description="A home for the analytics you already use."
      >
        <label>
          <span className="sr-only">Filter connections by product</span>
          <select
            aria-label="Filter connections by product"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="all">All products</option>
            {data.products.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </PageHeading>
      <div className="notice">
        <ShieldCheck size={18} />
        <span>
          <strong>Demo connections only.</strong> No Google or Vercel account
          access, tokens, or passwords are requested.
        </span>
      </div>
      <div className="integration-grid">
        {(Object.keys(providers) as Provider[]).map((source) => (
          <section className="panel integration-card" key={source}>
            <ProviderIcon provider={source} />
            <h2>{providers[source].name}</h2>
            <p>{providers[source].description}</p>
            <div className="connection-list">
              {products.map((p) => {
                const connected = data.connections.some(
                  (c) =>
                    c.productId === p.id &&
                    c.provider === source &&
                    c.connected,
                );
                return (
                  <div key={p.id}>
                    <div className="connection-product">
                      <ProductIcon product={p} />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {connected ? "Demo connected" : "Not connected"}
                        </small>
                      </span>
                    </div>
                    <button
                      className={`button small-button ${connected ? "secondary" : "dark"}`}
                      aria-label={`${connected ? "Disconnect" : "Connect"} ${providers[source].name} for ${p.name}`}
                      onClick={() => toggleConnection(p.id, source)}
                    >
                      {connected ? <Unplug size={14} /> : "Connect demo"}
                    </button>
                  </div>
                );
              })}
              {!products.length && <p>Add a product to connect a source.</p>}
            </div>
            <div className="integration-footer">
              <LockKeyhole size={13} />
              Live authorization comes later
            </div>
          </section>
        ))}
      </div>
      <div className="muted info-footnote">
        Disconnecting a demo source hides its metrics from the overview.
        Reconnecting restores the sample data.
      </div>
    </>
  );
}
export function Settings() {
  const { data, saveSettings, reset } = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState(data.workspace.name);
  const [prefs, setPrefs] = useState(data.preferences);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) saveSettings(name.trim(), prefs);
  }
  return (
    <>
      <PageHeading
        title="Make yourself at home."
        description="A workspace that fits the way you build."
      />
      <form onSubmit={submit} className="settings-form">
        <section className="panel settings-section">
          <div>
            <h2>Workspace details</h2>
            <p>Your own corner of ProductPulse.</p>
          </div>
          <div>
            <label>
              Workspace name
              <input
                maxLength={60}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="workspace-owner">
              <span className="profile-avatar">SD</span>
              <div>
                <strong>Demo owner</strong>
                <small>Owner · personal workspace</small>
              </div>
              <span className="subtle-badge">Full access</span>
            </div>
          </div>
        </section>
        <section className="panel settings-section">
          <div>
            <h2>Your briefing</h2>
            <p>
              Save preferences for future delivery.
              <br />
              No emails are sent in this preview.
            </p>
          </div>
          <div>
            <label className="toggle-row">
              <span>
                <strong>Daily pulse</strong>
                <small>A short summary of your portfolio’s activity.</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={prefs.digest}
                onChange={(e) =>
                  setPrefs({ ...prefs, digest: e.target.checked })
                }
              />
            </label>
            <label className="toggle-row">
              <span>
                <strong>Weekly perspective</strong>
                <small>Trends, milestones, and a bigger picture.</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={prefs.weekly}
                onChange={(e) =>
                  setPrefs({ ...prefs, weekly: e.target.checked })
                }
              />
            </label>
            <label className="threshold-label">
              Traffic change threshold
              <select
                value={prefs.threshold}
                onChange={(e) =>
                  setPrefs({ ...prefs, threshold: Number(e.target.value) })
                }
              >
                <option value={10}>10% change</option>
                <option value={20}>20% change</option>
                <option value={30}>30% change</option>
              </select>
            </label>
            <p className="form-hint">
              Saved for future alerts. Sample insights do not change with this
              preference.
            </p>
          </div>
        </section>
        <div className="settings-save">
          <span>Preferences are saved on this device.</span>
          <button className="button dark" type="submit">
            Save changes
          </button>
        </div>
      </form>
      <section className="panel reset-section">
        <div>
          <h2>A fresh start</h2>
          <p>
            Restore the original sample products, connections, and preferences.
          </p>
        </div>
        <button className="button secondary" onClick={() => setConfirm(true)}>
          <RotateCcw size={15} />
          Reset demo
        </button>
      </section>
      <Modal
        open={confirm}
        title="Restore the demo workspace?"
        onClose={() => setConfirm(false)}
      >
        <p>
          Your locally added products and settings will be replaced by the
          original demo. This cannot be undone.
        </p>
        <div className="form-actions">
          <button
            className="button secondary"
            onClick={() => setConfirm(false)}
          >
            Keep my changes
          </button>
          <button
            className="button dark"
            onClick={() => {
              reset();
              setName("My workspace");
              setPrefs({ digest: true, weekly: true, threshold: 20 });
              setConfirm(false);
            }}
          >
            Reset demo
          </button>
        </div>
      </Modal>
    </>
  );
}
export function Billing() {
  const { data } = useWorkspace();
  const plan = plans[data.workspace.planId];
  return (
    <>
      <PageHeading
        title="Built for your next chapter."
        description="A personal workspace today. Room to grow when you need it."
      />
      <div className="billing-hero">
        <div>
          <span className="tiny-label">YOUR CURRENT PLAN</span>
          <h2>{plan.name}</h2>
          <p>
            Explore ProductPulse with sample data.
            <br />
            No card, no trial clock, no charges.
          </p>
        </div>
        <div className="billing-price">
          $0<small>during the frontend preview</small>
        </div>
      </div>
      <div className="detail-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Workspace usage</h2>
            <Layers3 size={20} />
          </div>
          <div className="usage-content">
            <div>
              <strong>Products</strong>
              <span>
                {data.products.length} of {plan.productLimit}
              </span>
            </div>
            <progress value={data.products.length} max={plan.productLimit} />
            <p>
              Your demo workspace includes analytics views, sample insights, and
              local preferences.
            </p>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Billing status</h2>
            <ShieldCheck size={20} />
          </div>
          <div className="usage-content">
            <span className="subtle-badge">No subscription</span>
            <p>
              There is no payment method on file. Paid plans and checkout are
              not enabled in this version.
            </p>
            <Link to="/legal">
              Read the preview notices
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <div className="digest-banner">
        <Bell size={25} />
        <div>
          <h3>Simple plans, when the time is right.</h3>
          <p>
            Future Starter and Studio plans are outlined on the homepage.
            Pricing is not yet announced.
          </p>
        </div>
        <Link className="button secondary" to="/#plans">
          Explore planned plans
        </Link>
      </div>
    </>
  );
}
