import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Search,
  Globe,
  Trash2,
  ChevronLeft,
  Plug,
  LayoutGrid,
  List,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "../state/Workspace";
import {
  Empty,
  Modal,
  PageHeading,
  PeriodSelect,
  ProductIcon,
  ProviderIcon,
  Change,
} from "../components/UI";
import { ProductTable } from "./Dashboard";
import { series, summary, format } from "../data/demo";
import { TrafficChart } from "../components/Chart";
import { providers, type Provider } from "../domain/types";
export function AddProduct({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addProduct } = useWorkspace();
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    const raw = String(f.get("domain")).trim();
    try {
      const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname.includes(".") ||
        url.username ||
        url.password
      )
        throw new Error("Enter a valid website domain, such as example.com.");
      if (!name) throw new Error("Enter a product name.");
      addProduct(name, url.hostname.toLowerCase());
      e.currentTarget.reset();
      setError("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add this product.",
      );
    }
  }
  return (
    <Modal
      open={open}
      title="A new product, one clear view."
      onClose={() => {
        setError("");
        onClose();
      }}
    >
      <p className="muted">Give your product a home in this demo workspace.</p>
      <form onSubmit={submit}>
        <label>
          Product name
          <input
            name="name"
            placeholder="Your next big idea"
            required
            maxLength={60}
          />
        </label>
        <label>
          Website
          <input
            name="domain"
            placeholder="example.com"
            required
            maxLength={253}
          />
        </label>
        <p className="form-hint">
          This adds a local demo product. No website will be contacted.
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button dark" type="submit">
            Add product
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function Products() {
  const { data, period } = useWorkspace();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("grid");
  const filtered = data.products.filter((p) =>
    `${p.name} ${p.domain}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Good ideas. All in one place."
        description="Every product in your portfolio, with room for the next one."
      >
        <button className="button dark" onClick={() => setOpen(true)}>
          <Plus size={17} />
          Add product
        </button>
      </PageHeading>
      <div className="filter-toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Search products"
            placeholder="Find a product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="toolbar-right">
          <PeriodSelect />
          <div className="segmented">
            <button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>
      {view === "list" ? (
        <section className="panel">
          <ProductTable query={query} />
        </section>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => {
            const m = summary([p], period);
            const count = data.connections.filter(
              (c) => c.productId === p.id && c.connected,
            ).length;
            const ga = data.connections.some(
              (c) =>
                c.productId === p.id && c.provider === "ga4" && c.connected,
            );
            return (
              <Link
                to={`/app/products/${p.id}`}
                key={p.id}
                className="product-card"
              >
                <div className="product-card-top">
                  <ProductIcon product={p} />
                  <ExternalLink size={17} />
                </div>
                <h2>{p.name}</h2>
                <p>{p.domain}</p>
                <div className="product-card-metric">
                  <strong>{ga ? format(m.users) : "—"}</strong>
                  {ga && <Change value={m.change} />}
                </div>
                <small>Daily active users, summed · {period} days</small>
                <TrafficChart data={series(ga ? [p] : [], period)} mini />
                <div className="product-card-footer">
                  <span>{count}/3 demo sources connected</span>
                  <span>View product</span>
                </div>
              </Link>
            );
          })}
          {!filtered.length && (
            <Empty title="No products found">
              Add a product or try another search.
            </Empty>
          )}
        </div>
      )}
      <AddProduct open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, period, removeProduct } = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  const p = data.products.find((p) => p.id === id);
  if (!p)
    return (
      <Empty title="Product not found">
        <Link to="/app/products">Return to your products</Link>
      </Empty>
    );
  const ga = data.connections.some(
    (c) => c.productId === id && c.provider === "ga4" && c.connected,
  );
  const gsc = data.connections.some(
    (c) => c.productId === id && c.provider === "gsc" && c.connected,
  );
  const m = summary(ga ? [p] : [], period);
  const sm = summary(gsc ? [p] : [], period);
  return (
    <>
      <Link to="/app/products" className="back-link">
        <ChevronLeft size={16} />
        All products
      </Link>
      <PageHeading title={p.name} description={p.domain}>
        <PeriodSelect />
        <button
          className="icon-button danger"
          aria-label="Remove product"
          onClick={() => setConfirm(true)}
        >
          <Trash2 size={18} />
        </button>
      </PageHeading>
      <div className="stats-grid">
        <div className="metric-card">
          <span className="metric-label">Daily active users · summed</span>
          <strong className="metric-value">{ga ? format(m.users) : "—"}</strong>
          <Change value={m.change} />
        </div>
        <div className="metric-card">
          <span className="metric-label">Google search clicks</span>
          <strong className="metric-value">
            {gsc ? format(sm.clicks) : "—"}
          </strong>
          <small>Search Console sample data</small>
        </div>
        <div className="metric-card">
          <span className="metric-label">Key events</span>
          <strong className="metric-value">
            {ga ? format(m.events) : "—"}
          </strong>
          <small>GA4 sample events</small>
        </div>
        <div className="metric-card">
          <span className="metric-label">Search impressions</span>
          <strong className="metric-value">
            {gsc ? format(sm.impressions) : "—"}
          </strong>
          <small>Search Console sample data</small>
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Traffic over time</h2>
            <p>Daily GA4 activity · sample data</p>
          </div>
          <Globe size={20} />
        </div>
        {ga ? (
          <TrafficChart data={series([p], period)} />
        ) : (
          <Empty title="Connect your first source">
            Use the demo integrations to fill this product with sample data.
          </Empty>
        )}
      </section>
      <div className="detail-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Top pages</h2>
            <span className="subtle-badge">Illustrative</span>
          </div>
          {ga ? (
            <div className="simple-rows">
              {["/", "/pricing", "/features", "/help"].map((path, i) => (
                <div key={path}>
                  <span>{path}</span>
                  <strong>
                    {format(Math.floor(m.users * [0.48, 0.27, 0.16, 0.09][i]))}
                  </strong>
                </div>
              ))}
              <small>Sample landing-page activity</small>
            </div>
          ) : (
            <Empty title="No page data">
              Connect the GA4 demo source to see page activity.
            </Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Connected sources</h2>
            <Link to="/app/integrations">
              <Plug size={18} />
            </Link>
          </div>
          <div className="simple-rows">
            {(Object.keys(providers) as Provider[]).map((source) => (
              <div key={source}>
                <span className="source-name">
                  <ProviderIcon provider={source} />
                  {providers[source].name}
                </span>
                <span className="subtle-badge">
                  {data.connections.some(
                    (c) =>
                      c.productId === id &&
                      c.provider === source &&
                      c.connected,
                  )
                    ? "Demo connected"
                    : "Not connected"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Modal
        open={confirm}
        title={`Remove ${p.name}?`}
        onClose={() => setConfirm(false)}
      >
        <p>
          This removes the product, its demo connections, and its alerts from
          this browser. Your actual website is unaffected.
        </p>
        <div className="form-actions">
          <button
            className="button secondary"
            onClick={() => setConfirm(false)}
          >
            Keep product
          </button>
          <button
            className="button danger-button"
            onClick={() => {
              removeProduct(p.id);
              navigate("/app/products");
            }}
          >
            Remove product
          </button>
        </div>
      </Modal>
    </>
  );
}
