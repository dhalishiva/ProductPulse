import { useEffect, useRef, useId, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  X,
  TrendingUp,
  TrendingDown,
  Triangle,
  BarChart3,
  Search,
  ChevronDown,
} from "lucide-react";
import type { Product, Provider } from "../domain/types";
import { useWorkspace } from "../state/Workspace";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="ProductPulse home"
    >
      <span className="brand-mark">
        <Activity size={24} strokeWidth={2.4} />
      </span>
      <span>
        Product<span className="brand-weight">Pulse</span>
      </span>
    </Link>
  );
}
export function ProductIcon({ product }: { product: Product }) {
  return (
    <span
      className="product-icon"
      style={{ background: product.color + "18", color: product.color }}
    >
      {product.initials}
    </span>
  );
}
export function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <span className={`provider-icon ${provider}`}>
      {provider === "ga4" ? (
        <BarChart3 size={20} />
      ) : provider === "gsc" ? (
        <Search size={19} />
      ) : (
        <Triangle size={18} fill="currentColor" />
      )}
    </span>
  );
}
export function Change({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`change ${positive ? "positive" : "negative"}`}>
      {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{" "}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function PeriodSelect() {
  const { period, setPeriod } = useWorkspace();
  return (
    <label className="select-wrap">
      <span className="sr-only">Date range</span>
      <select
        aria-label="Date range"
        value={period}
        onChange={(e) => setPeriod(Number(e.target.value) as 7 | 28 | 90)}
      >
        <option value={7}>Last 7 days</option>
        <option value={28}>Last 28 days</option>
        <option value={90}>Last 90 days</option>
      </select>
      <ChevronDown size={15} />
    </label>
  );
}
export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    else if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Activity size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
