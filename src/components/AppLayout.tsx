import { useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Layers3,
  ChartNoAxesCombined,
  Bell,
  Plug,
  Settings2,
  CircleHelp,
  PanelLeftClose,
  Menu,
  ChevronDown,
  FlaskConical,
  Check,
  CreditCard,
  Globe,
  X,
} from "lucide-react";
import { Brand } from "./UI";
import { useWorkspace } from "../state/Workspace";
const nav = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/products", label: "Products", icon: Layers3 },
  { to: "/app/acquisition", label: "Acquisition", icon: ChartNoAxesCombined },
  { to: "/app/alerts", label: "Insights & alerts", icon: Bell },
  { to: "/app/integrations", label: "Integrations", icon: Plug },
];
export default function AppLayout() {
  const { data, ready, storageError, toast } = useWorkspace();
  const [mobile, setMobile] = useState(false);
  const location = useLocation();
  const unread = data.alerts.filter((a) => !a.read).length;
  const section =
    nav.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
    )?.label ??
    (location.pathname.includes("billing") ? "Plan & billing" : "Settings");
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <Link
          to="/app/settings"
          className="workspace-switch"
          onClick={() => setMobile(false)}
        >
          <span className="workspace-avatar">M</span>
          <span>
            <strong>{data.workspace.name}</strong>
            <small>Personal workspace</small>
          </span>
          <ChevronDown size={14} />
        </Link>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="App navigation">
          {nav.map((n) => (
            <NavLink
              end={n.end}
              key={n.to}
              to={n.to}
              onClick={() => setMobile(false)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.label === "Insights & alerts" && unread > 0 && (
                <span className="nav-count">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-note">
            <span className="tiny-label">YOUR PERSONAL HQ</span>
            <h4>
              A little clarity.
              <br />A lot less tab-switching.
            </h4>
            <Link to="/app/billing" onClick={() => setMobile(false)}>
              View your plan <CreditCard size={14} />
            </Link>
          </div>
          <nav aria-label="Workspace tools">
            <NavLink to="/app/settings" onClick={() => setMobile(false)}>
              <Settings2 size={18} />
              Settings
            </NavLink>
            <Link to="/help">
              <CircleHelp size={18} />
              Help & resources
            </Link>
          </nav>
          <div className="profile">
            <span className="profile-avatar">SD</span>
            <div>
              <strong>Demo owner</strong>
              <small>Personal preview</small>
            </div>
            <PanelLeftClose size={17} />
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-only"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{section}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <FlaskConical size={13} />
              Demo workspace
            </span>
            <Link to="/" className="icon-button" aria-label="Visit homepage">
              <Globe size={19} />
            </Link>
            <Link
              to="/app/alerts"
              className="notification-button"
              aria-label={`${unread} unread alerts`}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </Link>
            <span className="profile-avatar small">SD</span>
          </div>
        </header>
        <main id="main-content" className="workspace-main">
          {storageError && (
            <div role="alert" className="notice warning">
              {storageError}
            </div>
          )}
          {ready ? (
            <Outlet />
          ) : (
            <div className="empty" role="status">
              Opening your workspace…
            </div>
          )}
        </main>
        <footer className="app-footer">
          <span>Sample data · through Sep 30, 2026 · no live connections</span>
          <span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/help">Help</Link>
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
