import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { demoRepository, freshDemo, WORKSPACE_ID } from "../data/demo";
import type {
  Period,
  Product,
  Snapshot,
  Provider,
  Preferences,
} from "../domain/types";
import { plans } from "../domain/types";
interface WorkspaceContextValue {
  data: Snapshot;
  period: Period;
  setPeriod: (p: Period) => void;
  ready: boolean;
  storageError: string;
  addProduct: (name: string, domain: string) => void;
  removeProduct: (id: string) => void;
  toggleConnection: (productId: string, provider: Provider) => void;
  markRead: (id?: string) => void;
  saveSettings: (name: string, preferences: Preferences) => void;
  reset: () => void;
  toast: string;
  notify: (text: string) => void;
}
const Context = createContext<WorkspaceContextValue | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(freshDemo);
  const [period, setPeriod] = useState<Period>(28);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [toast, setToast] = useState("");
  useEffect(() => {
    let active = true;
    demoRepository
      .load(WORKSPACE_ID)
      .then((value) => {
        if (active) setData(value);
      })
      .catch(() => {
        if (active)
          setStorageError(
            "Browser storage is unavailable. Changes will last until this page is closed.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        demoRepository.save(data);
      } catch {
        setStorageError(
          "Changes could not be saved in this browser. Keep this page open to retain them.",
        );
      }
    }
  }, [data, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  function addProduct(name: string, domain: string) {
    if (data.products.length >= plans[data.workspace.planId].productLimit)
      throw new Error("The personal preview supports up to 10 products.");
    if (
      data.products.some((p) => p.domain.toLowerCase() === domain.toLowerCase())
    )
      throw new Error("This domain is already in your workspace.");
    const p: Product = {
      id: crypto.randomUUID(),
      workspaceId: data.workspace.id,
      name,
      domain,
      initials: name.charAt(0).toUpperCase(),
      color: "#7687a5",
      base: 0,
      trend: 0,
    };
    setData((d) => ({
      ...d,
      products: [...d.products, p],
      connections: [
        ...d.connections,
        ...(["ga4", "gsc", "vercel"] as Provider[]).map((provider) => ({
          productId: p.id,
          provider,
          connected: false,
        })),
      ],
    }));
    setToast("Product added. Connect a demo source to explore sample data.");
  }
  return (
    <Context.Provider
      value={{
        data,
        period,
        setPeriod,
        ready,
        storageError,
        toast,
        notify: setToast,
        addProduct,
        removeProduct(id) {
          setData((d) => ({
            ...d,
            products: d.products.filter((p) => p.id !== id),
            connections: d.connections.filter((c) => c.productId !== id),
            alerts: d.alerts.filter((a) => a.productId !== id),
          }));
          setToast("Product removed from this demo workspace.");
        },
        toggleConnection(productId, provider) {
          setData((d) => ({
            ...d,
            products: d.products.map((p) =>
              p.id === productId && p.base === 0
                ? { ...p, base: 35, trend: 0.1 }
                : p,
            ),
            connections: d.connections.map((c) =>
              c.productId === productId && c.provider === provider
                ? { ...c, connected: !c.connected }
                : c,
            ),
          }));
          setToast(
            "Demo connection updated. No external account was accessed.",
          );
        },
        markRead(id) {
          setData((d) => ({
            ...d,
            alerts: d.alerts.map((a) =>
              !id || a.id === id ? { ...a, read: true } : a,
            ),
          }));
        },
        saveSettings(name, preferences) {
          setData((d) => ({
            ...d,
            workspace: { ...d.workspace, name },
            preferences,
          }));
          setToast("Preferences saved in this browser.");
        },
        reset() {
          demoRepository
            .reset(WORKSPACE_ID)
            .then(setData)
            .catch(() => {
              setData(freshDemo());
              setStorageError(
                "Demo restored in memory. Browser storage is unavailable.",
              );
            });
          setToast("Demo workspace restored.");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkspaceProvider is required");
  return value;
}
