import { Link } from "react-router-dom";
import {
  Activity,
  Check,
  ChartNoAxesCombined,
  Layers3,
  Bell,
  ShieldCheck,
  Plus,
  MousePointer2,
  Eye,
  Users,
  LayoutDashboard,
  Plug,
  CircleHelp,
  Settings2,
  Sparkles,
  ChevronRight,
  Target,
} from "lucide-react";
import { Brand, ProductIcon, ProviderIcon } from "../components/UI";
import { TrafficChart, Sparkline } from "../components/Chart";
import { freshDemo, series, summary, format } from "../data/demo";
const sample = freshDemo();
const stats = summary(sample.products, 28);
function Showcase() {
  return (
    <div
      className="showcase"
      aria-label="ProductPulse dashboard preview with illustrative data"
    >
      <aside>
        <Brand />
        <div className="showcase-workspace">
          <span>M</span>
          <strong>My workspace</strong>
        </div>
        <small>WORKSPACE</small>
        <div className="showcase-nav active">
          <LayoutDashboard size={14} />
          Overview
        </div>
        <div className="showcase-nav">
          <Layers3 size={14} />
          Products
        </div>
        <div className="showcase-nav">
          <ChartNoAxesCombined size={14} />
          Acquisition
        </div>
        <div className="showcase-nav">
          <Bell size={14} />
          Insights & alerts <b>2</b>
        </div>
        <div className="showcase-nav">
          <Plug size={14} />
          Integrations
        </div>
        <div className="showcase-sidebar-bottom">
          <div className="showcase-nav">
            <Settings2 size={14} />
            Settings
          </div>
          <div className="showcase-nav">
            <CircleHelp size={14} />
            Help center
          </div>
        </div>
      </aside>
      <div className="showcase-content">
        <div className="showcase-top">
          <span>
            Workspace / <strong>Overview</strong>
          </span>
          <span className="subtle-badge">Demo workspace</span>
        </div>
        <div className="showcase-body">
          <div className="showcase-title">
            <div>
              <h3>A pulse on every product.</h3>
              <p>Your portfolio at a glance. More clarity, fewer tabs.</p>
            </div>
            <span>Last 28 days⌄</span>
          </div>
          <div className="showcase-stats">
            {[
              [Users, "Daily users, summed", format(stats.users)],
              [MousePointer2, "Search clicks", format(stats.clicks)],
              [Eye, "Search impressions", format(stats.impressions)],
              [Target, "Key events", format(stats.events)],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof Users;
              return (
                <div key={String(label)}>
                  <span>
                    {String(label)}
                    <I size={13} />
                  </span>
                  <strong>{String(value)}</strong>
                  <small>Sample portfolio activity</small>
                </div>
              );
            })}
          </div>
          <div className="showcase-mid">
            <div className="showcase-chart">
              <h4>
                Traffic, with perspective <span>● GA4 users</span>
              </h4>
              <TrafficChart data={series(sample.products, 28)} mini />
            </div>
            <div className="showcase-insight">
              <LightIcon />
              <h4>
                Your ideas.
                <br />
                Finding their people.
              </h4>
              <p>2 insights worth a closer look.</p>
              <span>
                Review insights <ChevronRight size={11} />
              </span>
            </div>
          </div>
          <div className="showcase-table">
            <h4>
              Your products<span>+ Add product</span>
            </h4>
            {sample.products.slice(0, 3).map((p) => (
              <div key={p.id}>
                <span>
                  <ProductIcon product={p} />
                  <strong>{p.name}</strong>
                </span>
                <b>{format(summary([p], 28).users)}</b>
                <Sparkline trend={p.trend} />
                <span className="showcase-sources">
                  <ProviderIcon provider="ga4" />
                  <ProviderIcon provider="gsc" />
                  <ProviderIcon provider="vercel" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function LightIcon() {
  return <Sparkles size={18} />;
}
export function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-label">
            <span className="label-line" />
            FOR PEOPLE BUILDING MORE THAN ONE THING
          </div>
          <h1>
            Every product.
            <br />
            <span>One clear view.</span>
          </h1>
          <p className="hero-description">
            Your traffic, search performance, and little wins.
            <br className="desktop-break" /> Together in a calmer corner of the
            internet.
          </p>
          <div className="hero-actions">
            <Link to="/app" className="button lime large-button">
              Explore the demo
              <ChevronRight size={18} />
            </Link>
            <a href="#how-it-works" className="hero-secondary">
              Take a closer look
            </a>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={14} />
              No sign-up needed
            </span>
            <span>
              <Check size={14} />
              Sample data, real experience
            </span>
          </div>
          <div className="hero-preview-caption">
            <span>
              <i />
              YOUR PORTFOLIO, AT A GLANCE
            </span>
            <span>Less tab-switching. More perspective.</span>
          </div>
          <Showcase />
        </div>
      </section>
      <section className="integrations-strip">
        <div className="container">
          <p>Built around the tools you already know.</p>
          <div>
            <span>
              <ProviderIcon provider="ga4" />
              Google Analytics
            </span>
            <span>
              <ProviderIcon provider="gsc" />
              Google Search Console
            </span>
            <span>
              <ProviderIcon provider="vercel" />
              Vercel Analytics
            </span>
          </div>
          <small>Preview integrations · live connections coming later</small>
        </div>
      </section>
      <section id="features" className="features-section section-space">
        <div className="container">
          <div className="section-intro">
            <div>
              <span className="eyebrow">BUILD MORE. CHECK LESS.</span>
              <h2>
                A home for the
                <br />
                bigger picture.
              </h2>
            </div>
            <p>
              You put a lot into your products. Seeing how they’re doing
              shouldn’t feel like another project.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-wide">
              <span className="feature-icon">
                <Layers3 size={23} />
              </span>
              <h3>
                Your whole portfolio.
                <br />
                Not another pile of tabs.
              </h3>
              <p>
                Bring every product into one workspace. Compare momentum and
                find the one that needs your attention.
              </p>
              <div className="feature-products">
                {sample.products.slice(0, 3).map((p) => (
                  <div key={p.id}>
                    <ProductIcon product={p} />
                    <strong>{p.name}</strong>
                    <Sparkline trend={p.trend} />
                    <span className={p.trend > 0 ? "positive" : "negative"}>
                      {p.trend > 0 ? "+" : ""}
                      {Math.round(p.trend * 100)}%
                    </span>
                  </div>
                ))}
                <small>Illustrative trends</small>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon">
                <ChartNoAxesCombined size={23} />
              </span>
              <h3>
                From discovery
                <br />
                to the first click.
              </h3>
              <p>
                See search visibility alongside on-site activity. Different
                sources, clearly labeled, with room to explore.
              </p>
              <div className="feature-search">
                <span>GOOGLE SEARCH</span>
                <strong>Finding your audience.</strong>
                <div>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <small>A little more momentum.</small>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon">
                <Bell size={23} />
              </span>
              <h3>
                The signal.
                <br />
                Without the noise.
              </h3>
              <p>
                A quiet space for meaningful changes and small wins, so you can
                spend more time building.
              </p>
              <div className="feature-alert">
                <span>
                  <Sparkles size={16} />A small win
                </span>
                <strong>Your product is picking up.</strong>
                <p>A sample insight worth celebrating.</p>
                <span className="feature-alert-tag">
                  <Check size={13} />
                  On your radar
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="how-section section-space" id="how-it-works">
        <div className="container">
          <span className="eyebrow">A SIMPLER ROUTINE</span>
          <h2>
            One check-in.
            <br />
            Then back to building.
          </h2>
          <div className="steps-grid">
            {[
              {
                icon: Plus,
                title: "Give your products a home.",
                text: "Add a name and a domain. Your workspace grows with your ideas.",
              },
              {
                icon: Plug,
                title: "Bring your sources together.",
                text: "Try the demo connections for Google Analytics, Search Console, and Vercel.",
              },
              {
                icon: Activity,
                title: "Find your daily pulse.",
                text: "See the trends, explore an insight, and decide what deserves your time.",
              },
            ].map((s, i) => (
              <article key={s.title}>
                <div className="step-number">
                  0{i + 1}
                  <s.icon size={22} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="plans" className="plans-section section-space">
        <div className="container">
          <div className="section-intro">
            <div>
              <span className="eyebrow">
                START PERSONAL. LEAVE ROOM TO GROW.
              </span>
              <h2>
                Built for your
                <br />
                next chapter.
              </h2>
            </div>
            <p>
              ProductPulse starts as a personal tool. Future subscriptions are
              planned; nothing is billed in this preview.
            </p>
          </div>
          <div className="plans-grid">
            <article className="plan-card featured">
              <div className="plan-top">
                <h3>Personal preview</h3>
                <span>AVAILABLE NOW</span>
              </div>
              <div className="plan-price">
                Free<span>during the frontend preview</span>
              </div>
              <p>Your own space to explore the full experience.</p>
              <ul>
                <li>
                  <Check size={16} />
                  Up to 10 demo products
                </li>
                <li>
                  <Check size={16} />
                  Portfolio and product views
                </li>
                <li>
                  <Check size={16} />
                  Sample insights and reports
                </li>
                <li>
                  <Check size={16} />
                  Local workspace preferences
                </li>
              </ul>
              <Link to="/app" className="button dark">
                Open your demo workspace
              </Link>
            </article>
            {[
              {
                name: "Starter",
                text: "For a small portfolio finding its feet.",
                features: [
                  "Up to 5 products planned",
                  "Live analytics connections planned",
                  "Daily briefing planned",
                ],
              },
              {
                name: "Studio",
                text: "For builders with a bigger collection.",
                features: [
                  "Up to 25 products planned",
                  "Multiple members planned",
                  "Expanded reporting planned",
                ],
              },
            ].map((p) => (
              <article className="plan-card" key={p.name}>
                <div className="plan-top">
                  <h3>{p.name}</h3>
                  <span className="planned-label">PLANNED</span>
                </div>
                <div className="plan-price future">
                  Coming later<span>Pricing to be announced</span>
                </div>
                <p>{p.text}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="plan-unavailable">
                  Not available for purchase
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="faq-section section-space">
        <div className="container faq-grid">
          <div>
            <span className="eyebrow">A FEW GOOD QUESTIONS</span>
            <h2>
              A little more
              <br />
              clarity.
            </h2>
            <Link to="/help">
              Visit the help center
              <ChevronRight size={16} />
            </Link>
          </div>
          <div>
            {[
              {
                q: "Can I connect my real analytics accounts?",
                a: "Not in this frontend preview. All charts and insights use sample data. The integration screens let you try connecting and disconnecting demo sources without granting account access.",
              },
              {
                q: "Do I need to add another tracking script?",
                a: "No script is needed for this demo. The planned live version will read reports from your existing analytics providers.",
              },
              {
                q: "Why do Google Analytics and Vercel show different numbers?",
                a: "They measure activity differently. ProductPulse keeps their counts separate and labels each source rather than adding overlapping visitors together.",
              },
              {
                q: "Is ProductPulse free?",
                a: "This frontend preview is free. Paid plans are planned, but there is no checkout, active subscription, or trial deadline.",
              },
            ].map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <Plus size={18} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="closing-section">
        <div className="container">
          <span className="closing-mark">
            <Activity size={34} />
          </span>
          <h2>
            Keep your finger
            <br />
            on the pulse.
          </h2>
          <p>Your next check-in starts here.</p>
          <Link to="/app" className="button lime large-button">
            Explore ProductPulse
            <ChevronRight size={18} />
          </Link>
          <span className="closing-note">
            <ShieldCheck size={14} />
            No account. No card. Just a clearer view.
          </span>
        </div>
      </section>
    </>
  );
}
