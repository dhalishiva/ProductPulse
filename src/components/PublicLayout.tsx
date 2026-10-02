import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X, Activity } from "lucide-react";
import { Brand } from "./UI";
export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="public-site">
      <a className="skip-link" href="#public-main">
        Skip to content
      </a>
      <header className="public-header">
        <div className="public-nav container">
          <Brand light />
          <nav className={menu ? "open" : ""} aria-label="Main navigation">
            <Link to="/#features" onClick={() => setMenu(false)}>
              Why ProductPulse
            </Link>
            <Link to="/#how-it-works" onClick={() => setMenu(false)}>
              How it works
            </Link>
            <Link to="/#plans" onClick={() => setMenu(false)}>
              Plans
            </Link>
            <NavLink to="/help" onClick={() => setMenu(false)}>
              Help center
            </NavLink>
          </nav>
          <div className="public-nav-actions">
            <Link to="/app" className="button lime">
              Open demo app
            </Link>
            <button
              className="icon-button public-menu"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <Brand />
              <p>A little clarity for everything you’re building.</p>
            </div>
            <div className="footer-links">
              <div>
                <strong>Product</strong>
                <Link to="/app">Demo workspace</Link>
                <Link to="/#features">Features</Link>
                <Link to="/#plans">Planned plans</Link>
              </div>
              <div>
                <strong>Resources</strong>
                <Link to="/help">Help center</Link>
                <Link to="/help#demo">About the demo</Link>
                <Link to="/legal">Legal & notices</Link>
              </div>
              <div>
                <strong>The essentials</strong>
                <Link to="/privacy">Privacy policy</Link>
                <Link to="/terms">Terms & conditions</Link>
                <Link to="/legal#cookies">Storage & cookies</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} ProductPulse. Frontend preview.
            </span>
            <span>
              <Activity size={14} />
              Every product. One clear view.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
