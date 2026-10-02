import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  BookOpen,
  Plug,
  ShieldCheck,
  ChartNoAxesCombined,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
const articles = [
  {
    category: "Getting started",
    q: "What can I do in the demo?",
    a: "Open the demo app to explore four sample products. Change the date range, view product details, review insights, export a CSV, and try adding your own product. All numbers are illustrative and are not measurements of the named websites.",
  },
  {
    category: "Getting started",
    q: "How do I add a product?",
    a: "In the app, open Products and choose Add product. Enter a name and domain. Your new product starts without analytics. Open Integrations and connect a demo source to generate sample activity. This does not access your website.",
  },
  {
    category: "Connections",
    q: "Can I connect Google Analytics, Search Console, or Vercel?",
    a: "The current version simulates these connections. Use Connect demo to add sample data, or disconnect a source to hide its metrics. No authorization flow, API token, or password is used. Live integrations will be implemented separately.",
  },
  {
    category: "Understanding metrics",
    q: "What does “daily active users, summed” mean?",
    a: "This demo adds daily activity across the selected dates and products. Someone who visits on two days can contribute to both days. This is not a deduplicated count of people over the full period or across products.",
  },
  {
    category: "Understanding metrics",
    q: "Why are traffic sources shown separately?",
    a: "GA4 users, Google Search clicks, and Vercel visitors describe different activity. They should not be added together. The chart source selector lets you view each measure independently.",
  },
  {
    category: "Understanding metrics",
    q: "Are the insights calculated from live traffic?",
    a: "No. Insights are fixed examples to demonstrate the experience. Changing the reporting period or alert threshold does not recalculate them. A future monitoring engine will need complete periods, minimum traffic thresholds, and reliable synchronization.",
  },
  {
    category: "Workspace & privacy",
    q: "Where are my changes saved?",
    a: "Product names, domains, demo connection choices, read status, and preferences are stored in this browser’s local storage. They are not synced between devices. Private browsing, clearing site data, or resetting the demo may remove them.",
  },
  {
    category: "Workspace & privacy",
    q: "Will I receive a daily briefing?",
    a: "No messages are sent in this preview. You can save your daily and weekly preferences to explore how settings will work. Delivery needs a backend and your explicit setup in a future version.",
  },
  {
    category: "Workspace & privacy",
    q: "How do I clear my demo data?",
    a: "Open Settings and choose Reset demo to restore the original sample workspace. To remove all saved data, clear this site’s storage in your browser. Resetting the demo does not affect any actual Google or Vercel account.",
  },
  {
    category: "Plans",
    q: "Will I be charged?",
    a: "No. The frontend preview has no payment collection or subscriptions. Starter and Studio are future plan concepts; prices and commercial terms have not been set.",
  },
];
export function Help() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const filtered = articles.filter(
    (a) =>
      (category === "All topics" || a.category === category) &&
      `${a.q} ${a.a}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="information-hero">
        <div className="container">
          <span className="eyebrow">THE PRODUCTPULSE HELP CENTER</span>
          <h1>
            A little help.
            <br />A clearer path.
          </h1>
          <p>Get to know your workspace, your metrics, and the demo.</p>
          <label className="help-search">
            <Search size={20} />
            <input
              aria-label="Search help articles"
              placeholder="What would you like to know?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </section>
      <div className="container help-content">
        <div className="help-categories">
          {[
            { icon: BookOpen, name: "Getting started" },
            { icon: Plug, name: "Connections" },
            { icon: ChartNoAxesCombined, name: "Understanding metrics" },
            { icon: ShieldCheck, name: "Workspace & privacy" },
          ].map((c) => (
            <button
              className={category === c.name ? "active" : ""}
              key={c.name}
              onClick={() =>
                setCategory(category === c.name ? "All topics" : c.name)
              }
            >
              <c.icon size={23} />
              <strong>{c.name}</strong>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <div className="help-results-heading">
          <h2>{category}</h2>
          {category !== "All topics" && (
            <button
              className="text-button"
              onClick={() => setCategory("All topics")}
            >
              Show all topics
            </button>
          )}
          <span>{filtered.length} articles</span>
        </div>
        <div className="help-articles">
          {filtered.map((a) => (
            <details key={a.q}>
              <summary>
                <span>
                  <small>{a.category}</small>
                  {a.q}
                </span>
                <Plus size={18} />
              </summary>
              <p>{a.a}</p>
            </details>
          ))}
          {!filtered.length && (
            <div className="empty">
              <Search size={28} />
              <h3>No matching articles</h3>
              <p>Try “demo”, “data”, or a different topic.</p>
              <button
                className="button secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("All topics");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <div className="help-demo-note" id="demo">
          <FlaskConical size={26} />
          <div>
            <h3>A working frontend, with sample data.</h3>
            <p>
              This preview helps you explore the experience. Real analytics,
              account authentication, subscriptions, and notification delivery
              are not enabled.
            </p>
          </div>
          <Link to="/app" className="button dark">
            Try the demo
          </Link>
        </div>
      </div>
    </>
  );
}
const documents = {
  "/privacy": {
    title: "Privacy policy",
    intro: "How this frontend preview handles information.",
    sections: [
      [
        "About this preview",
        "ProductPulse is currently a frontend demonstration. The charts, products, and insights contain illustrative data. This notice describes the demo implementation; a production policy must be completed before collecting customer information.",
      ],
      [
        "Information saved on your device",
        "When you use the demo, product names and domains you enter, your workspace name, connection selections, alert read status, and briefing preferences are saved in your browser’s local storage. Do not enter account credentials or sensitive personal information. These settings are not synchronized to a ProductPulse database.",
      ],
      [
        "Analytics accounts and credentials",
        "The demo does not request access to Google Analytics, Search Console, or Vercel accounts. Connection controls only change sample data in your browser. No OAuth tokens, payment details, or passwords are collected by the application.",
      ],
      [
        "Hosting and network requests",
        "Your browser requests the application files from the hosting provider, which may process connection information such as an IP address and request logs under its own policies. This codebase does not install analytics trackers, advertising pixels, or third-party fonts. The final hosting provider and its practices must be identified before a public commercial release.",
      ],
      [
        "Retention and control",
        "Demo settings remain in local storage until you clear this site’s storage or your browser removes them. Reset demo restores the sample workspace; clearing site data removes the stored workspace entirely. You can use the preview without creating an account.",
      ],
      [
        "Before live integrations launch",
        "The production policy must identify the operator and contact details, actual data flows, processors, retention periods, security practices, and applicable user rights. This preview notice does not assert legal compliance for an unimplemented service.",
      ],
    ],
  },
  "/terms": {
    title: "Terms & conditions",
    intro: "Draft terms for the ProductPulse frontend preview.",
    sections: [
      [
        "Preview status",
        "This interface is provided for demonstration and evaluation. Features may change. No paid service, service-level agreement, or subscription is offered through this preview. These draft terms require operator details and review before commercial use.",
      ],
      [
        "Using the demo",
        "You may explore the interface and enter non-sensitive sample product details. Do not use the preview to store credentials, confidential business data, or information you are not permitted to use. Local demo settings may be changed or removed by your browser.",
      ],
      [
        "Illustrative information",
        "All analytics, trends, and insights are sample information, including when familiar product names or domains appear. Do not rely on these numbers for business, financial, or operational decisions. Sample connections do not establish access to any external account.",
      ],
      [
        "Plans and payments",
        "Future plan descriptions are concepts only. No prices, purchases, auto-renewals, trial conversions, or refunds are currently implemented. Separate commercial terms and an explicit purchase flow will be required before paid subscriptions begin.",
      ],
      [
        "Third-party services",
        "Google Analytics, Google Search Console, and Vercel are independent services. Their names identify intended integrations and do not imply partnership or endorsement. Their own terms will apply if live integrations are introduced.",
      ],
      [
        "Availability and changes",
        "The preview may be updated or discontinued. Browser-local changes are not backed up by ProductPulse. No uptime or data-retention commitment is made for this demonstration.",
      ],
      [
        "Commercial launch requirements",
        "The operator identity, support contact, governing terms, liability provisions, cancellation rules, and any required dispute procedures remain to be specified and reviewed for the intended service and jurisdictions.",
      ],
    ],
  },
};
export function LegalDocument() {
  const location = useLocation();
  const doc =
    documents[location.pathname as keyof typeof documents] ??
    documents["/privacy"];
  return (
    <>
      <section className="document-hero">
        <div className="container">
          <span className="eyebrow">THE ESSENTIALS</span>
          <h1>{doc.title}</h1>
          <p>{doc.intro}</p>
          <span className="document-date">Draft · updated October 1, 2026</span>
        </div>
      </section>
      <div className="container document-layout">
        <aside>
          <Link
            to="/privacy"
            className={location.pathname === "/privacy" ? "active" : ""}
          >
            Privacy policy
          </Link>
          <Link
            to="/terms"
            className={location.pathname === "/terms" ? "active" : ""}
          >
            Terms & conditions
          </Link>
          <Link to="/legal">Legal & notices</Link>
          <Link to="/help">Help center</Link>
        </aside>
        <article className="document-body">
          <div className="notice warning">
            <InfoIcon />
            <span>
              Preview draft. Operator and contact details must be completed
              before a commercial launch.
            </span>
          </div>
          {doc.sections.map(([title, text], i) => (
            <section key={title}>
              <h2>
                {i + 1}. {title}
              </h2>
              <p>{text}</p>
            </section>
          ))}
          <Link to="/legal" className="back-link">
            View legal notices
            <ChevronRight size={16} />
          </Link>
        </article>
      </div>
    </>
  );
}
function InfoIcon() {
  return <ShieldCheck size={20} />;
}
export function Legal() {
  return (
    <>
      <section className="document-hero">
        <div className="container">
          <span className="eyebrow">OPEN ABOUT THE DETAILS</span>
          <h1>Legal & notices</h1>
          <p>Where the preview stands, and what comes next.</p>
        </div>
      </section>
      <div className="container legal-content">
        <div className="legal-cards">
          <Link to="/privacy">
            <ShieldCheck size={26} />
            <h2>Privacy policy</h2>
            <p>
              How this demo uses browser storage and handles your information.
            </p>
            <span>
              Read the notice
              <ChevronRight size={16} />
            </span>
          </Link>
          <Link to="/terms">
            <BookOpen size={26} />
            <h2>Terms & conditions</h2>
            <p>Draft terms for exploring the frontend preview.</p>
            <span>
              Read the draft
              <ChevronRight size={16} />
            </span>
          </Link>
        </div>
        <article className="document-body">
          <section>
            <h2>About ProductPulse</h2>
            <p>
              ProductPulse is a product analytics dashboard in development. This
              version is a frontend demo. Live provider connections,
              authentication, cloud data storage, message delivery, and billing
              are not enabled.
            </p>
          </section>
          <section id="cookies">
            <h2>Storage & cookies</h2>
            <p>
              The application stores demo workspace changes under the
              browser-local key <code>productpulse:demo:v1</code>. The
              application itself does not set tracking or advertising cookies.
              Your hosting platform may have separate operational practices. Use
              Settings → Reset demo to restore sample content, or clear site
              data in your browser to erase local settings.
            </p>
          </section>
          <section>
            <h2>Third-party names</h2>
            <p>
              Google Analytics and Google Search Console are Google products.
              Vercel Analytics is a Vercel product. ProductPulse is not
              presented as affiliated with or endorsed by these providers.
              Sample product names and domains do not imply access to their real
              analytics.
            </p>
          </section>
          <section>
            <h2>Operator & contact information</h2>
            <p>
              Commercial operator details and a support contact have not been
              configured for this preview. These details, finalized legal
              documents, and the actual hosting and processing arrangements must
              be supplied before opening a paid service.
            </p>
          </section>
          <section>
            <h2>Accessibility & feedback</h2>
            <p>
              The preview is designed for keyboard navigation and small screens.
              Use the help center for guidance on the available demo features.
            </p>
            <Link to="/help">
              Explore the help center
              <ChevronRight size={16} />
            </Link>
          </section>
        </article>
      </div>
    </>
  );
}
export function NotFound() {
  return (
    <div className="not-found container">
      <span className="eyebrow">404 · A LITTLE OFF TRACK</span>
      <h1>This page missed a beat.</h1>
      <p>Let’s get you back to a clearer view.</p>
      <Link className="button dark" to="/app">
        Open your workspace
      </Link>
      <Link className="text-button" to="/">
        Back to homepage
      </Link>
    </div>
  );
}
