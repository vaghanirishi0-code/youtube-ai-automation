import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Clock,
  Share2,
} from "lucide-react";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";

const STEP_LABELS: Record<string, string> = {
  niche: "Niche Research",
  script: "Script Writing",
  copyright: "Copyright Analysis",
  seo: "SEO Optimization",
  thumbnail: "Thumbnail Design",
  titledesc: "Title & Description",
  ratio: "Screen Ratio",
  review: "Video Review",
  upload: "Upload",
  done: "Complete",
};

export function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { actor } = useActor();

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => actor!.listProjects(),
    enabled: !!actor,
  });

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => actor!.listSocialAccounts(),
    enabled: !!actor,
  });

  const completed =
    projects?.filter((p) => p.currentStep === "done").length ?? 0;
  const connectedAccounts = accounts?.filter((a) => a.connected).length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your YouTube AI Automation Command Center
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-ocid="dashboard.projects.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clapperboard className="w-4 h-4" /> Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-3xl font-display font-bold">
                {projects?.length ?? 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-ocid="dashboard.accounts.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAccounts ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-3xl font-display font-bold">
                {connectedAccounts}
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-ocid="dashboard.completed.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Completed Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-3xl font-display font-bold">{completed}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent projects */}
      <Card data-ocid="dashboard.recent.card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-base">
            Recent Projects
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            data-ocid="dashboard.pipeline.link"
            onClick={() => onNavigate("projects")}
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingProjects ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !projects?.length ? (
            <div
              data-ocid="dashboard.recent.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              <Clapperboard className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                No projects yet. Start with Niche Research!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p, i) => (
                <div
                  key={p.id}
                  data-ocid={`dashboard.recent.item.${i + 1}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.niche}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {STEP_LABELS[p.currentStep] ?? p.currentStep}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
