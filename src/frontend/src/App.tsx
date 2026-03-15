import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Image,
  LayoutDashboard,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Automation } from "./pages/Automation";
import { CopyrightSEO } from "./pages/CopyrightSEO";
import { Dashboard } from "./pages/Dashboard";
import { NicheResearch } from "./pages/NicheResearch";
import { Projects } from "./pages/Projects";
import { SocialAccounts } from "./pages/SocialAccounts";
import { ThumbnailCreator } from "./pages/ThumbnailCreator";

export type Page =
  | "dashboard"
  | "niche"
  | "projects"
  | "accounts"
  | "thumbnail"
  | "copyright"
  | "automation";

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "niche" as Page, label: "Niche Research", icon: Search },
  { id: "projects" as Page, label: "Pipeline", icon: Clapperboard },
  { id: "automation" as Page, label: "Automation", icon: Bot },
  { id: "accounts" as Page, label: "Social Accounts", icon: Share2 },
  { id: "thumbnail" as Page, label: "Thumbnail Creator", icon: Image },
  { id: "copyright" as Page, label: "Copyright & SEO", icon: ShieldCheck },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [startNicheId, setStartNicheId] = useState<string | undefined>();

  function goToProjects(nicheId?: string) {
    setStartNicheId(nicheId);
    setPage("projects");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-56",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2 p-4 border-b border-sidebar-border",
            collapsed && "justify-center",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Clapperboard className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-sm text-sidebar-foreground">
              YT Automation
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => {
                  setStartNicheId(undefined);
                  setPage(item.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          data-ocid="nav.collapse.toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "niche" && <NicheResearch onStartProject={goToProjects} />}
        {page === "projects" && <Projects initialNiche={startNicheId} />}
        {page === "automation" && <Automation />}
        {page === "accounts" && <SocialAccounts />}
        {page === "thumbnail" && <ThumbnailCreator />}
        {page === "copyright" && <CopyrightSEO />}
      </main>

      <Toaster />
    </div>
  );
}
