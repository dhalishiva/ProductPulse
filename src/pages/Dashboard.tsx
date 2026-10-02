import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  Users,
  MousePointer2,
  Target,
  Eye,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  CircleCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "../state/Workspace";
import { summary, series, format } from "../data/demo";
import {
  Change,
  Empty,
  PageHeading,
  PeriodSelect,
  ProductIcon,
  ProviderIcon,
} from "../components/UI";
import { Sparkline, TrafficChart } from "../components/Chart";
import { AddProduct } from "./Products";
import type { Provider } from "../domain/types";
export function Dashboard() {
  const { data, period, notify } = useWorkspace();
  const [addOpen, setAddOpen] = useState(false);
  const [metric, setMetric] = useState<"users" | "clicks" | "vercel">("users");
  const connected = (provider: Provider) =>
    data.products.filter((p) =>
      data.connections.some(
        (c) => c.productId === p.id && c.provider === provider && c.connected,
      ),
    );
  const ga = summary(connected("ga4"), period),
    search = summary(connected("gsc"), period);
  const chartProducts = connected(
    metric === "users" ? "ga4" : metric === "clicks" ? "gsc" : "vercel",
  );
  const days = series(chartProducts, period);
  const total = summary(chartProducts, period);
  const exportCsv = () => {
    const rows = [
      [
        "Product",
        "Domain",
        "GA4 daily active user sum",
        "GSC clicks",
        "GA4 key events",
      ],
      ...data.products.map((p) => {
        const s = summary([p], period);
        const has = (provider: Provider) =>
          data.connections.some(
            (c) =>
              c.productId === p.id && c.provider === provider && c.connected,
          );
        return [
          p.name,
          p.domain,
          has("ga4") ? s.users : "",
          has("gsc") ? s.clicks : "",
          has("ga4") ? s.events : "",
        ];
      }),
    ];
    const safe = (v: unknown) => {
      const str = String(v);
      return (
        '"' +
        (/^[=+\-@\t\r]/.test(str) ? "'" : "") +
        str.replace(/"/g, '""') +
        '"'
      );
    };
    const blob = new Blob(
      [rows.map((r) => r.map(safe).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productpulse-demo-${period}d.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Demo report exported.");
  };
  return (
    <>
      <PageHeading
        title="A pulse on every product."
        description="Your portfolio at a glance. See what’s growing and what needs a little attention."
      >
        <PeriodSelect />
        <button className="button secondary" onClick={exportCsv}>
          <Download size={16} />
          <span>Export</span>
        </button>
      </PageHeading>
      <div className="overview-context">
        <span>
          <span className="status-dot" />
          {data.products.length} products in your workspace
        </span>
        <span>Sample period: {days[0].label} – Sep 30, 2026</span>
      </div>
      <div className="stats-grid">
        <Metric
          label="Daily active users · summed"
          value={format(ga.users)}
          icon={<Users size={17} />}
          foot={
            <>
              <Change value={ga.change} />
              <span>vs. previous {period} days</span>
            </>
          }
        />
        <Metric
          label="Google search clicks"
          value={format(search.clicks)}
          icon={<MousePointer2 size={17} />}
          foot={
            <>
              <ProviderIcon provider="gsc" />
              <span>Search Console · sample</span>
            </>
          }
        />
        <Metric
          label="Search impressions"
          value={format(search.impressions)}
          icon={<Eye size={17} />}
          foot={
            <>
              <span className="metric-hint">
                {search.impressions
                  ? ((search.clicks / search.impressions) * 100).toFixed(2)
                  : "0"}
                % CTR
              </span>
              <span>across connected products</span>
            </>
          }
        />
        <Metric
          label="Key events"
          value={format(ga.events)}
          icon={<Target size={17} />}
          foot={
            <>
              <span className="metric-hint">GA4</span>
              <span>configured sample events</span>
            </>
          }
        />
      </div>
      <div className="overview-middle">
        <section className="panel traffic-panel">
          <div className="panel-heading">
            <div>
              <h2>Traffic, with perspective</h2>
              <p>A little movement. A clearer picture.</p>
            </div>
            <label className="chart-source">
              <span className="sr-only">Chart source</span>
              <select
                aria-label="Chart source"
                value={metric}
                onChange={(e) => setMetric(e.target.value as typeof metric)}
              >
                <option value="users">GA4 users</option>
                <option value="clicks">Search clicks</option>
                <option value="vercel">Vercel visitors</option>
              </select>
            </label>
          </div>
          <div className="chart-headline">
            <strong>{format(total[metric])}</strong>
            <span>
              {metric === "users"
                ? "daily active users, summed"
                : metric === "clicks"
                  ? "search clicks"
                  : "daily visitors, summed"}
            </span>
            <div className="chart-legend">
              <span>
                <i />
                Current period
              </span>
              {metric === "users" && (
                <span>
                  <i className="previous" />
                  Previous period
                </span>
              )}
            </div>
          </div>
          {chartProducts.length ? (
            <TrafficChart data={days} metric={metric} />
          ) : (
            <Empty title="No connected sources">
              Connect a demo source from Integrations to see a trend.
            </Empty>
          )}
          <p className="chart-note">
            {metric === "users"
              ? "User counts are daily sums, not deduplicated people across dates or products."
              : metric === "clicks"
                ? "Google Search clicks are separate from on-site traffic."
                : "Vercel counts are shown separately from Google Analytics."}
          </p>
        </section>
        <aside className="insight-card">
          <div className="insight-kicker">
            <Lightbulb size={18} />
            THE BIG PICTURE
          </div>
          <h2>
            Less checking.
            <br />
            More building.
          </h2>
          <p>
            You have{" "}
            <strong>
              {data.alerts.filter((a) => !a.read).length} unread insights
            </strong>{" "}
            in your demo workspace. A good place to start your next check-in.
          </p>
          <div className="insight-preview">
            <span className="insight-symbol">
              <ArrowUpRight size={20} />
            </span>
            <div>
              <strong>
                {data.alerts.find((a) => !a.read)?.title ??
                  "You’re all caught up"}
              </strong>
              <span>
                {data.alerts.some((a) => !a.read)
                  ? "Explore your sample insights"
                  : "Keep your focus on building"}
              </span>
            </div>
          </div>
          <Link to="/app/alerts" className="button dark">
            Review insights
            <ChevronRight size={16} />
          </Link>
          <small>Illustrative insights, not live monitoring</small>
        </aside>
      </div>
      <section className="panel products-panel">
        <div className="panel-heading">
          <div className="inline-heading">
            <h2>Your products</h2>
            <span className="count-badge">{data.products.length}</span>
          </div>
          <button
            className="button secondary small-button"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
        <ProductTable />
        <div className="panel-footer">
          <span>
            <CircleCheck size={14} />
            One workspace. Your whole portfolio.
          </span>
          <Link to="/app/products">
            Manage products
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>
      <div className="bottom-note">
        <SlidersHorizontal size={16} />
        <span>
          Your dashboard, your pace. Configure your daily briefing in{" "}
          <Link to="/app/settings">workspace settings</Link>.
        </span>
      </div>
      <AddProduct open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
function Metric({
  label,
  value,
  icon,
  foot,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  foot: React.ReactNode;
}) {
  return (
    <section className="metric-card">
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <strong className="metric-value">{value}</strong>
      <div className="metric-footer">{foot}</div>
    </section>
  );
}
export function ProductTable({ query = "" }: { query?: string }) {
  const { data, period } = useWorkspace();
  const products = data.products.filter((p) =>
    `${p.name} ${p.domain}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (!products.length)
    return (
      <Empty
        title={query ? "No matching products" : "Your next idea belongs here"}
      >
        {query
          ? "Try a different name or domain."
          : "Add a product to start organizing your analytics."}
      </Empty>
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Daily users, summed</th>
            <th>Search clicks</th>
            <th>Key events</th>
            <th>Trend</th>
            <th>Sources</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const m = summary([p], period);
            const has = (provider: Provider) =>
              data.connections.some(
                (c) =>
                  c.productId === p.id &&
                  c.provider === provider &&
                  c.connected,
              );
            return (
              <tr key={p.id}>
                <td>
                  <Link to={`/app/products/${p.id}`} className="product-cell">
                    <ProductIcon product={p} />
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.domain}</small>
                    </div>
                  </Link>
                </td>
                <td>
                  {has("ga4") ? (
                    <div className="number-cell">
                      {format(m.users)}
                      <Change value={m.change} />
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>{has("gsc") ? format(m.clicks) : "—"}</td>
                <td>{has("ga4") ? format(m.events) : "—"}</td>
                <td>{has("ga4") ? <Sparkline trend={p.trend} /> : "—"}</td>
                <td>
                  <div className="source-stack">
                    {(["ga4", "gsc", "vercel"] as Provider[]).map((s) => (
                      <span
                        key={s}
                        title={`${s}: ${has(s) ? "demo connected" : "disconnected"}`}
                        className={!has(s) ? "disconnected" : ""}
                      >
                        <ProviderIcon provider={s} />
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <Link
                    className="icon-button"
                    to={`/app/products/${p.id}`}
                    aria-label={`View ${p.name}`}
                  >
                    <ChevronRight size={17} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
