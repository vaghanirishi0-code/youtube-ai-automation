import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  Edit3,
  Eye,
  Film,
  Image,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import { useActor } from "../hooks/useActor";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", defaultRatio: "16:9" },
  { id: "instagram", label: "Instagram", defaultRatio: "1:1" },
  { id: "facebook", label: "Facebook", defaultRatio: "16:9" },
  { id: "tiktok", label: "TikTok", defaultRatio: "9:16" },
  { id: "twitter", label: "Twitter / X", defaultRatio: "16:9" },
];

const RATIOS = ["16:9", "9:16", "1:1", "4:5"];

const STEPS = [
  { id: "niche", label: "Niche Research" },
  { id: "script", label: "Script Writing" },
  { id: "copyright", label: "Copyright Analysis" },
  { id: "seo", label: "SEO Optimization" },
  { id: "thumbnail", label: "Thumbnail Design" },
  { id: "titledesc", label: "Title & Description" },
  { id: "ratio", label: "Screen Ratio" },
  { id: "review", label: "Video Review" },
  { id: "videogen", label: "AI Video Generation" },
  { id: "upload", label: "Publish Video" },
];

const VIDEO_GEN_STAGES = [
  "Analyzing script...",
  "Generating scenes...",
  "Rendering frames...",
  "Adding transitions...",
  "Encoding video...",
  "Finalizing...",
];

function getStepData(project: Project, stepId: string): string {
  return project.steps.find(([k]) => k === stepId)?.[1] ?? "";
}

function setStepData(project: Project, stepId: string, value: string): Project {
  const existing = project.steps.filter(([k]) => k !== stepId);
  return { ...project, steps: [...existing, [stepId, value]] };
}

function extractTitleFromTitleDesc(data: string): string {
  const line = data.split("\n").find((l) => l.startsWith("Title: "));
  return line ? line.replace("Title: ", "").trim() : "";
}

function extractDescriptionFromTitleDesc(data: string): string {
  const lines = data.split("\n");
  const blankIdx = lines.findIndex((l) => l.trim() === "");
  if (blankIdx === -1) return "";
  return lines
    .slice(blankIdx + 1)
    .join("\n")
    .replace(/^Description:\n?/, "")
    .trim();
}

function generateAutoData(project: Project, stepId: string): string {
  const niche = project.niche;
  const title = project.title;
  const ideaDescription =
    project.steps?.find((s) => s[0] === "idea")?.[1] || "";
  const year = new Date().getFullYear();

  switch (stepId) {
    case "niche":
      return niche;
    case "script": {
      const style = getStepData(project, "scriptstyle") || "educational";
      if (style === "short-form") {
        return `HOOK (0-5s):\n${ideaDescription ? `${ideaDescription}\n\n` : ""}Quick tips on ${niche}! Here's what you need to know in 60 seconds.\n\nKEY POINTS:\n⚡ Tip 1: The fastest way to get started with ${niche}\n⚡ Tip 2: The one thing most people miss in ${niche}\n⚡ Tip 3: Pro secret for ${niche} that changes everything\n\nCTA:\nFollow for more ${niche} hacks! Drop a 🔥 if this helped.`;
      }
      if (style === "storytelling") {
        return `STORY HOOK:\n${ideaDescription ? `${ideaDescription}\n\n` : ""}Let me tell you a story about ${niche} that changed everything for me.\n\nTHE JOURNEY:\nIt was just another ordinary day when I first discovered ${niche}. I had no idea how much it would transform the way I think and work.\n\nTHE TURNING POINT:\nAfter months of struggling, I finally cracked the code on ${niche}. The secret? It wasn't about working harder — it was about working smarter.\n\nTHE LESSON:\nNow I want to share exactly what I learned so you can fast-track your ${niche} success.\n\nOUTRO:\nEvery expert was once a beginner. Your ${niche} journey starts today — smash that like button and let's grow together!`;
      }
      return `INTRO:\n${ideaDescription ? `Concept: ${ideaDescription}\n\n` : ""}Hey everyone! Welcome back to the channel. Today we're diving deep into ${niche} — and trust me, you don't want to miss this one.\n\nMAIN CONTENT:\nLet's start with the fundamentals of ${niche}. Whether you're just getting started or looking to level up your skills, this video has everything you need.\n\nFirst, let's talk about why ${niche} is more important now than ever before. The industry has changed dramatically, and those who adapt will thrive.\n\nNext, I'll share the top 5 strategies that experts use in ${niche} that most people overlook. These tips have helped thousands of people achieve incredible results.\n\nFinally, we'll cover the common mistakes beginners make in ${niche} and exactly how to avoid them — saving you months of frustration.\n\nOUTRO:\nThat's a wrap! If you found this helpful, hit that like button and subscribe for more ${niche} content every week. Drop your questions in the comments below — I read every single one. See you in the next video!`;
    }
    case "copyright":
      return `Copyright Analysis for "${title}":\n✅ Original content detected\n✅ No copyright issues found\n⚠️ Use royalty-free music (recommended: Epidemic Sound, Artlist)\n✅ All visuals are original or licensed\n✅ Safe to upload to all platforms`;
    case "seo":
      return `SEO Keywords:\n#${niche.replace(/ /g, "")} #youtube #viral #trending #${niche.split(" ")[0]}tips\n\nTags: ${niche}, how to ${niche}, ${niche} tutorial, ${niche} tips, best ${niche}, ${niche} for beginners, ${niche} guide ${year}\n\nOptimized for: Search CTR, Watch Time, Audience Retention\n📈 Estimated reach: High competition niche with strong engagement signals`;
    case "thumbnail":
      return `Bold text "${title}" centered on a vibrant gradient background (deep blue to electric purple). Show key ${niche} imagery in the foreground. Use high-contrast yellow/white text with a subtle drop shadow. Include a shocked/excited face reaction shot in the bottom-right corner. Add a bright "NEW" badge in the top-left. Optimized for high CTR with bold, readable fonts at thumbnail size.`;
    case "titledesc":
      return `Title: ${title} - Complete Guide ${year}\n\nDescription:\nIn this video, we dive deep into ${niche}. Whether you're a beginner or advanced, this guide covers everything you need to know to succeed.\n\n🔔 Subscribe for more ${niche} content every week!\n\n📌 Chapters:\n0:00 Introduction\n1:30 Why ${niche} Matters\n3:00 Top Strategies\n6:30 Common Mistakes to Avoid\n9:00 Pro Tips & Tricks\n11:00 Conclusion\n\n🔗 Resources mentioned:\n• Check the pinned comment for links\n\n#${niche.replace(/ /g, "")} #youtube #tutorial`;
    case "ratio":
      return project.screenRatio;
    case "review":
      return `Reviewed and approved on ${new Date().toLocaleDateString()}. All content verified and ready for upload.`;
    case "videogen":
      return JSON.stringify({
        status: "generated",
        duration: "8:42",
        resolution: "1920x1080",
        format: "MP4",
        fps: 30,
        generated: true,
        watermark: false,
      });
    default:
      return `Completed: ${STEPS.find((s) => s.id === stepId)?.label}`;
  }
}

export function Projects({ initialNiche }: { initialNiche?: string }) {
  const { actor, isFetching: actorLoading } = useActor();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    niche: initialNiche ?? "",
    platform: "youtube",
    screenRatio: "16:9",
    scriptStyle: "educational",
    videoFormat: "realistic",
    videoType: "single" as "single" | "series",
    seriesParts: 3,
    videoDuration: 10,
    ideaDescription: "",
  });
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [localProject, setLocalProject] = useState<Project | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const [genStage, setGenStage] = useState("Analyzing script...");
  const [genProgress, setGenProgress] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [deleteVideoOpen, setDeleteVideoOpen] = useState(false);
  const [editThumbnailOpen, setEditThumbnailOpen] = useState(false);
  const [thumbTitle, setThumbTitle] = useState("");
  const [thumbStyle, setThumbStyle] = useState("bold");
  const [thumbBg, setThumbBg] = useState("#0f172a");
  const [editingVideo, setEditingVideo] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const isNewlyCreated = useRef(false);
  const autoRunStarted = useRef(false);

  useEffect(() => {
    if (initialNiche) {
      setNewForm((f) => ({ ...f, niche: initialNiche }));
      setNewOpen(true);
    }
  }, [initialNiche]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => actor!.listProjects(),
    enabled: !!actor,
  });

  useQuery({
    queryKey: ["accounts"],
    queryFn: () => actor!.listSocialAccounts(),
    enabled: !!actor,
  });

  const selectedProject =
    localProject ?? projects?.find((p) => p.id === selectedId) ?? null;

  const createMutation = useMutation({
    mutationFn: async () => {
      const project: Project = {
        id: crypto.randomUUID(),
        title: newForm.title,
        niche: newForm.niche,
        platform: newForm.platform,
        screenRatio: newForm.screenRatio,
        status: "active",
        currentStep: "niche",
        steps: newForm.ideaDescription
          ? [["idea", newForm.ideaDescription] as [string, string]]
          : [],
        stepFiles: [],
      };
      if (!actor) throw new Error("Not ready");
      await actor.createProject(project);
      return project;
    },
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setNewOpen(false);
      setNewForm({
        title: "",
        niche: "",
        platform: "youtube",
        screenRatio: "16:9",
        scriptStyle: "educational",
        videoFormat: "realistic",
        videoType: "single" as "single" | "series",
        seriesParts: 3,
        videoDuration: 10,
        ideaDescription: "",
      });
      setSelectedId(project.id);
      setLocalProject(project);
      isNewlyCreated.current = true;
      autoRunStarted.current = false;
      toast.success("Project created — AI pipeline starting...");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const saveMutation = useMutation({
    mutationFn: async (project: Project) => {
      await actor!.updateProject(project);
    },
    onSuccess: (_, project) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setLocalProject(project);
    },
    onError: () => toast.error("Failed to save"),
  });

  // Auto-run trigger
  useEffect(() => {
    if (
      localProject &&
      isNewlyCreated.current &&
      !autoRunStarted.current &&
      !autoRunning &&
      localProject.currentStep !== "upload" &&
      localProject.currentStep !== "done"
    ) {
      autoRunStarted.current = true;
      isNewlyCreated.current = false;
      startAutoRun(localProject);
    }
  });

  async function simulateProcess(stepId: string, duration = 2500) {
    setProcessingStep(stepId);
    await new Promise((r) => setTimeout(r, duration));
    setProcessingStep(null);
  }

  async function simulateVideoGen() {
    setProcessingStep("videogen");
    setGenProgress(0);
    const totalMs = 3000;
    const stageMs = totalMs / VIDEO_GEN_STAGES.length;
    for (let s = 0; s < VIDEO_GEN_STAGES.length; s++) {
      setGenStage(VIDEO_GEN_STAGES[s]);
      const startPct = Math.round((s / VIDEO_GEN_STAGES.length) * 100);
      const endPct = Math.round(((s + 1) / VIDEO_GEN_STAGES.length) * 100);
      const steps = 10;
      for (let t = 0; t <= steps; t++) {
        await new Promise((r) => setTimeout(r, stageMs / steps));
        setGenProgress(
          startPct + Math.round(((endPct - startPct) * t) / steps),
        );
      }
    }
    setProcessingStep(null);
  }

  async function startAutoRun(project: Project) {
    setAutoRunning(true);
    let current = project;

    const startIndex = STEPS.findIndex((s) => s.id === current.currentStep);
    const uploadIndex = STEPS.findIndex((s) => s.id === "upload");

    for (let i = startIndex; i < uploadIndex; i++) {
      const step = STEPS[i];

      if (step.id === "videogen") {
        await simulateVideoGen();
      } else {
        setProcessingStep(step.id);
        await new Promise((r) => setTimeout(r, 1500));
        setProcessingStep(null);
      }

      const autoData = generateAutoData(current, step.id);
      const nextStep = STEPS[i + 1]?.id ?? "done";
      const updated = setStepData(
        { ...current, currentStep: nextStep },
        step.id,
        autoData,
      );
      current = updated;
      setLocalProject({ ...updated });

      try {
        await actor!.updateProject(updated);
      } catch (_) {
        // non-blocking
      }
      qc.invalidateQueries({ queryKey: ["projects"] });
    }

    setAutoRunning(false);
    toast.success("AI pipeline complete! Review your video and publish.");
  }

  async function handleStepAction(stepId: string) {
    if (!selectedProject) return;

    if (stepId === "videogen") {
      await simulateVideoGen();
    } else {
      await simulateProcess(stepId);
    }

    let autoData = getStepData(selectedProject, stepId);
    const niche = selectedProject.niche;
    const title = selectedProject.title;

    if (stepId === "copyright" && !autoData) {
      autoData = `Copyright Analysis for "${title}":\n✅ Original content detected\n✅ No copyright issues found\n⚠️ Use royalty-free music\n✅ Safe to upload`;
    } else if (stepId === "seo" && !autoData) {
      autoData = `SEO Keywords:\n#${niche.replace(/ /g, "")} #youtube #viral #trending\n\nTags: ${niche}, how to ${niche}, ${niche} tutorial, ${niche} tips, best ${niche}\n\nOptimized for: Search CTR, Watch Time`;
    } else if (stepId === "titledesc" && !autoData) {
      autoData = `Title: ${title} - Complete Guide ${new Date().getFullYear()}\n\nDescription:\nIn this video, we dive deep into ${niche}. Whether you're a beginner or advanced, this guide covers everything you need to know.\n\n🔔 Subscribe for more ${niche} content!\n\n📌 Chapters:\n0:00 Introduction\n1:30 Main Content\n8:00 Tips & Tricks\n10:00 Conclusion`;
    } else if (stepId === "videogen" && !autoData) {
      autoData = generateAutoData(selectedProject, "videogen");
    }

    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    const nextStep = STEPS[stepIndex + 1]?.id ?? "done";
    const updated = setStepData(
      { ...selectedProject, currentStep: nextStep },
      stepId,
      autoData || `Completed: ${STEPS.find((s) => s.id === stepId)?.label}`,
    );
    setLocalProject(updated);
    saveMutation.mutate(updated);
  }

  function updateStepData(stepId: string, value: string) {
    if (!selectedProject) return;
    const updated = setStepData(selectedProject, stepId, value);
    setLocalProject(updated);
  }

  async function handleUpload() {
    if (!selectedProject) return;
    setProcessingStep("upload");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(i);
    }
    const updated = {
      ...selectedProject,
      currentStep: "done",
      status: "complete",
    };
    setLocalProject(updated);
    await actor!.updateProject(updated);
    qc.invalidateQueries({ queryKey: ["projects"] });
    setProcessingStep(null);
    setUploadProgress(0);
    toast.success(`Video published to ${selectedProject.platform}!`);
  }

  const currentStepIndex = STEPS.findIndex(
    (s) => s.id === selectedProject?.currentStep,
  );
  const isDone =
    selectedProject?.currentStep === "done" ||
    selectedProject?.status === "complete";

  if (selectedProject) {
    const titleDescData = getStepData(selectedProject, "titledesc");
    const videoTitle =
      extractTitleFromTitleDesc(titleDescData) || selectedProject.title;
    const videoDesc = extractDescriptionFromTitleDesc(titleDescData);
    const descLines = videoDesc.split("\n").filter(Boolean);
    const descPreview = descLines.slice(0, 3).join("\n");

    const handleDownloadVideo = () => {
      const script = getStepData(selectedProject, "script");
      const seo = getStepData(selectedProject, "seo");
      const titleDescData2 = getStepData(selectedProject, "titledesc");
      const payload = {
        title: videoTitle,
        description: videoDesc,
        script,
        seo,
        titleDesc: titleDescData2,
        generatedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_video_data.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Video data downloaded!");
    };

    const handleDeleteVideo = async () => {
      try {
        await actor!.deleteProject(selectedProject.id);
      } catch (_) {
        // best effort
      }
      setDeleteVideoOpen(false);
      setSelectedId(null);
      setLocalProject(null);
      setAutoRunning(false);
      isNewlyCreated.current = false;
      autoRunStarted.current = false;
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Video deleted.");
    };

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            data-ocid="pipeline.back.button"
            onClick={() => {
              setSelectedId(null);
              setLocalProject(null);
              setAutoRunning(false);
              isNewlyCreated.current = false;
              autoRunStarted.current = false;
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold">
              {selectedProject.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {selectedProject.niche} · {selectedProject.platform} ·{" "}
              {selectedProject.screenRatio}
            </p>
          </div>
          {isDone && (
            <Badge className="ml-auto" variant="default">
              Complete
            </Badge>
          )}
        </div>

        {/* AI Auto-run banner */}
        {autoRunning && (
          <div
            data-ocid="pipeline.autorun.loading_state"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/25"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                AI is completing your pipeline...
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sit back while AI handles each step automatically
              </p>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-green-500 shrink-0" />
          </div>
        )}

        {/* Step progress */}
        <div className="flex gap-1.5 items-center overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done = isDone || i < currentStepIndex;
            const active = !isDone && s.id === selectedProject.currentStep;
            return (
              <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                        ? "bg-primary/30 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done = isDone || i < currentStepIndex;
            const active = !isDone && step.id === selectedProject.currentStep;
            const processing = processingStep === step.id;
            const data = getStepData(selectedProject, step.id);

            return (
              <Card
                key={step.id}
                data-ocid={`pipeline.step.item.${i + 1}`}
                className={`transition-all ${
                  active
                    ? "border-green-500/50 bg-green-500/5"
                    : done
                      ? "opacity-70 border-green-500/30"
                      : "opacity-40"
                }`}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : active ? (
                        processing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-green-500" />
                        )
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span
                        className={`text-sm font-medium ${active ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {done && (
                        <Badge variant="secondary" className="text-xs">
                          Done
                        </Badge>
                      )}
                      {processing && (
                        <div
                          data-ocid={`pipeline.step.loading_state.${i + 1}`}
                          className="flex items-center gap-1.5 text-xs text-green-500"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />{" "}
                          {autoRunning ? "AI Processing..." : "Processing..."}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {(active || done) && (
                  <CardContent className="px-4 pb-4 space-y-3">
                    {/* Step content */}
                    {step.id === "niche" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Niche / Topic</Label>
                        <Input
                          data-ocid="pipeline.niche.input"
                          value={
                            getStepData(selectedProject, "niche") ||
                            selectedProject.niche
                          }
                          onChange={(e) =>
                            updateStepData("niche", e.target.value)
                          }
                          placeholder="Enter your niche"
                          disabled={done || autoRunning}
                        />
                      </div>
                    )}

                    {step.id === "script" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Style</Label>
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium capitalize">
                            {(() => {
                              const s =
                                getStepData(selectedProject, "scriptstyle") ||
                                "educational";
                              return s === "short-form"
                                ? "⚡ Short-Form"
                                : s === "storytelling"
                                  ? "📖 Storytelling"
                                  : "📚 Educational";
                            })()}
                          </span>
                        </div>
                        <Label className="text-xs">Video Script</Label>
                        <Textarea
                          data-ocid="pipeline.script.textarea"
                          value={data}
                          onChange={(e) =>
                            updateStepData("script", e.target.value)
                          }
                          placeholder="Write your video script here..."
                          rows={6}
                          disabled={done || autoRunning}
                        />
                      </div>
                    )}

                    {(step.id === "copyright" ||
                      step.id === "seo" ||
                      step.id === "titledesc") &&
                      data && (
                        <div className="p-3 rounded-lg bg-muted/40 text-xs whitespace-pre-line font-mono">
                          {data}
                        </div>
                      )}

                    {step.id === "thumbnail" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Thumbnail Description</Label>
                        <Textarea
                          data-ocid="pipeline.thumbnail.textarea"
                          value={data}
                          onChange={(e) =>
                            updateStepData("thumbnail", e.target.value)
                          }
                          placeholder="Describe your thumbnail design..."
                          rows={3}
                          disabled={done || autoRunning}
                        />
                      </div>
                    )}

                    {step.id === "ratio" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Screen Ratio</Label>
                        <div className="flex flex-wrap gap-2">
                          {RATIOS.map((r) => (
                            <button
                              type="button"
                              key={r}
                              data-ocid="pipeline.ratio.toggle"
                              disabled={done || autoRunning}
                              onClick={() => {
                                if (!done && !autoRunning) {
                                  const updated = {
                                    ...selectedProject,
                                    screenRatio: r,
                                  };
                                  setLocalProject(updated);
                                  updateStepData("ratio", r);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                selectedProject.screenRatio === r
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted text-muted-foreground border-border hover:bg-accent"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedProject.platform === "tiktok"
                            ? "TikTok recommends 9:16"
                            : selectedProject.platform === "instagram"
                              ? "Instagram recommends 1:1 or 4:5"
                              : "YouTube recommends 16:9"}
                        </p>
                      </div>
                    )}

                    {step.id === "review" && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Review your content before video generation
                        </p>
                        {["niche", "script", "seo", "titledesc"].map((sid) => {
                          const d = getStepData(selectedProject, sid);
                          if (!d) return null;
                          const label = STEPS.find((s) => s.id === sid)?.label;
                          return (
                            <div
                              key={sid}
                              className="p-2 rounded bg-muted/30 text-xs"
                            >
                              <p className="font-semibold mb-1">{label}</p>
                              <p className="text-muted-foreground line-clamp-3 whitespace-pre-line">
                                {d}
                              </p>
                            </div>
                          );
                        })}
                        <p className="text-xs text-muted-foreground">
                          Platform: <strong>{selectedProject.platform}</strong>{" "}
                          · Ratio:{" "}
                          <strong>{selectedProject.screenRatio}</strong>
                        </p>
                      </div>
                    )}

                    {/* AI Video Generation step */}
                    {step.id === "videogen" && (
                      <div className="space-y-3">
                        {processing && (
                          <div
                            data-ocid="pipeline.videogen.loading_state"
                            className="space-y-3"
                          >
                            {/* Video gen animation */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 shrink-0">
                                <Film className="w-5 h-5 text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Generating your video...
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 animate-pulse">
                                  {genStage}
                                </p>
                              </div>
                              <Loader2 className="w-5 h-5 animate-spin text-green-500 shrink-0" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{genStage}</span>
                                <span>{genProgress}%</span>
                              </div>
                              <Progress value={genProgress} className="h-2" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {VIDEO_GEN_STAGES.map((stage, si) => (
                                <div
                                  key={stage}
                                  className={`text-xs px-2 py-1 rounded-md text-center transition-colors ${
                                    stage === genStage
                                      ? "bg-green-500/20 text-green-600 dark:text-green-400 font-medium"
                                      : genProgress >=
                                          Math.round(
                                            ((si + 1) /
                                              VIDEO_GEN_STAGES.length) *
                                              100,
                                          )
                                        ? "bg-muted/60 text-muted-foreground line-through"
                                        : "bg-muted/30 text-muted-foreground/60"
                                  }`}
                                >
                                  {stage.replace("...", "")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Done state — video preview card */}
                        {!processing &&
                          data &&
                          (() => {
                            let videoMeta: {
                              duration?: string;
                              resolution?: string;
                              format?: string;
                            } = {};
                            try {
                              videoMeta = JSON.parse(data);
                            } catch (_) {
                              // ignore
                            }
                            return (
                              <div
                                data-ocid="pipeline.videogen.card"
                                className="rounded-xl border border-border overflow-hidden"
                              >
                                {/* Video thumbnail */}
                                <div
                                  data-ocid="pipeline.videogen.thumbnail"
                                  className="relative aspect-video overflow-hidden"
                                >
                                  <img
                                    src="/assets/generated/thumbnail-template.dim_1280x720.jpg"
                                    alt="Video thumbnail"
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                  {/* Bottom gradient for title readability */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                  {/* Play button center */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                                    </div>
                                  </div>
                                  {videoMeta.duration && (
                                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
                                      {videoMeta.duration}
                                    </div>
                                  )}
                                  {/* Title overlay at bottom */}
                                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                                    <p className="text-white font-bold text-sm leading-tight drop-shadow-lg line-clamp-2">
                                      {videoTitle}
                                    </p>
                                  </div>
                                </div>
                                {/* Video info */}
                                <div className="p-4 space-y-3 bg-card">
                                  <div className="flex items-start justify-between gap-2">
                                    {editingVideo ? (
                                      <input
                                        data-ocid="pipeline.videogen.title.input"
                                        className="flex-1 text-lg font-bold leading-snug text-foreground bg-muted/50 border border-border rounded px-2 py-1 outline-none focus:border-primary"
                                        value={editTitle}
                                        onChange={(e) =>
                                          setEditTitle(e.target.value)
                                        }
                                      />
                                    ) : (
                                      <p className="flex-1 text-lg font-bold leading-snug text-foreground">
                                        {videoTitle}
                                      </p>
                                    )}
                                    {!editingVideo && (
                                      <button
                                        type="button"
                                        data-ocid="pipeline.videogen.edit_button"
                                        className="shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                          setEditTitle(videoTitle);
                                          setEditDesc(videoDesc);
                                          setEditingVideo(true);
                                        }}
                                        title="Edit title & description"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {videoMeta.duration && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground">
                                          {videoMeta.duration}
                                        </span>{" "}
                                        duration
                                      </span>
                                    )}
                                    {videoMeta.resolution && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground">
                                          1080p
                                        </span>{" "}
                                        HD
                                      </span>
                                    )}
                                    {videoMeta.format && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-medium text-foreground">
                                          {videoMeta.format}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  {editingVideo ? (
                                    <div className="space-y-2">
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                        Description
                                      </p>
                                      <textarea
                                        data-ocid="pipeline.videogen.desc.textarea"
                                        className="w-full text-xs text-muted-foreground bg-muted/50 border border-border rounded px-2 py-1.5 outline-none focus:border-primary resize-none leading-relaxed"
                                        rows={5}
                                        value={editDesc}
                                        onChange={(e) =>
                                          setEditDesc(e.target.value)
                                        }
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          data-ocid="pipeline.videogen.save_button"
                                          className="flex-1 text-xs font-medium px-3 py-1.5 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                          onClick={() => {
                                            const updated = setStepData(
                                              selectedProject,
                                              "titledesc",
                                              `Title: ${editTitle}\n\nDescription:\n${editDesc}`,
                                            );
                                            setLocalProject(updated);
                                            setEditingVideo(false);
                                            toast.success(
                                              "Video details saved!",
                                            );
                                          }}
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          data-ocid="pipeline.videogen.cancel_button"
                                          className="flex-1 text-xs font-medium px-3 py-1.5 rounded border border-border text-muted-foreground hover:bg-muted transition-colors"
                                          onClick={() => setEditingVideo(false)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : videoDesc ? (
                                    <div>
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        Description
                                      </p>
                                      <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                        {descExpanded ? videoDesc : descPreview}
                                      </p>
                                      {descLines.length > 3 && (
                                        <button
                                          type="button"
                                          data-ocid="pipeline.videogen.toggle"
                                          className="text-xs text-primary mt-1 hover:underline"
                                          onClick={() =>
                                            setDescExpanded((e) => !e)
                                          }
                                        >
                                          {descExpanded
                                            ? "Show less"
                                            : `+${descLines.length - 3} more lines`}
                                        </button>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })()}

                        {/* Download, Delete & Edit Thumbnail actions */}
                        {!processing && data && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid="video.download_button"
                              onClick={handleDownloadVideo}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              data-ocid="video.delete_button"
                              onClick={() => setDeleteVideoOpen(true)}
                              className="flex-1"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Video
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid="pipeline.videogen.open_modal_button"
                              onClick={() => {
                                setThumbTitle(videoTitle);
                                setThumbStyle("bold");
                                setThumbBg("#0f172a");
                                setEditThumbnailOpen(true);
                              }}
                            >
                              <Image className="w-4 h-4 mr-2" /> Edit Thumbnail
                            </Button>
                          </div>
                        )}

                        {/* Edit Thumbnail Dialog */}
                        <Dialog
                          open={editThumbnailOpen}
                          onOpenChange={setEditThumbnailOpen}
                        >
                          <DialogContent data-ocid="pipeline.videogen.dialog">
                            <DialogHeader>
                              <DialogTitle>Edit Thumbnail</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <Label className="text-xs">Title</Label>
                                <Input
                                  data-ocid="pipeline.thumbnail.title.input"
                                  value={thumbTitle}
                                  onChange={(e) =>
                                    setThumbTitle(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">
                                  Thumbnail Style
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    {
                                      id: "animation",
                                      label: "Animation",
                                      img: "/assets/generated/thumb-style-animation.dim_400x225.jpg",
                                    },
                                    {
                                      id: "cinematic",
                                      label: "Cinematic",
                                      img: "/assets/generated/thumb-style-cinematic.dim_400x225.jpg",
                                    },
                                    {
                                      id: "realistic",
                                      label: "Realistic",
                                      img: "/assets/generated/thumb-style-realistic.dim_400x225.jpg",
                                    },
                                    {
                                      id: "documentary",
                                      label: "Documentary",
                                      img: "/assets/generated/thumb-style-documentary.dim_400x225.jpg",
                                    },
                                    {
                                      id: "bold",
                                      label: "Bold",
                                      img: "/assets/generated/thumb-style-bold.dim_400x225.jpg",
                                    },
                                    {
                                      id: "dark",
                                      label: "Dark",
                                      img: "/assets/generated/thumb-style-dark.dim_400x225.jpg",
                                    },
                                  ].map((s) => (
                                    <button
                                      type="button"
                                      key={s.id}
                                      data-ocid={`pipeline.thumbnail.${s.id}.toggle`}
                                      onClick={() => setThumbStyle(s.id)}
                                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${thumbStyle === s.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                                    >
                                      <img
                                        src={s.img}
                                        alt={s.label}
                                        className="w-full h-12 object-cover"
                                      />
                                      <div className="py-1 text-center text-xs font-medium">
                                        {s.label}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">
                                  Background Color
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    "#0f172a",
                                    "#7f1d1d",
                                    "#14532d",
                                    "#3b0764",
                                    "#1c1917",
                                    "#0c4a6e",
                                  ].map((c) => (
                                    <button
                                      type="button"
                                      key={c}
                                      onClick={() => setThumbBg(c)}
                                      className={`w-8 h-8 rounded-lg border-2 transition-all ${thumbBg === c ? "border-primary scale-110" : "border-transparent"}`}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">
                                  Preview (16:9)
                                </Label>
                                <div
                                  data-ocid="pipeline.thumbnail.canvas_target"
                                  className="relative w-full rounded-lg overflow-hidden"
                                  style={{
                                    aspectRatio: "16/9",
                                    background: thumbBg,
                                  }}
                                >
                                  <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                      backgroundImage:
                                        "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center px-6">
                                    <p
                                      className="text-white font-black text-sm leading-tight drop-shadow-lg line-clamp-2"
                                      style={{
                                        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                                      }}
                                    >
                                      {thumbTitle || "Your Title"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                data-ocid="pipeline.thumbnail.cancel_button"
                                onClick={() => setEditThumbnailOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                data-ocid="pipeline.thumbnail.save_button"
                                onClick={() => {
                                  setEditThumbnailOpen(false);
                                  toast.success("Thumbnail updated!");
                                }}
                              >
                                Save Thumbnail
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Delete confirmation dialog */}
                        {deleteVideoOpen && (
                          <div
                            data-ocid="video.delete_dialog"
                            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3"
                          >
                            <p className="text-sm font-semibold text-destructive">
                              Delete this video?
                            </p>
                            <p className="text-xs text-muted-foreground">
                              This will remove the generated video card. You can
                              regenerate it later.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                data-ocid="video.delete_confirm_button"
                                onClick={handleDeleteVideo}
                                className="flex-1"
                              >
                                Yes, Delete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                data-ocid="video.delete_cancel_button"
                                onClick={() => setDeleteVideoOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Manual trigger button */}
                        {active && !processing && !data && !autoRunning && (
                          <Button
                            size="sm"
                            data-ocid="pipeline.videogen.primary_button"
                            onClick={() => handleStepAction("videogen")}
                            className="w-full"
                          >
                            <Film className="w-4 h-4 mr-2" /> Generate Video
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Publish step */}
                    {step.id === "upload" && (
                      <div className="space-y-3">
                        {/* AI complete notice */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-xs text-primary font-medium">
                            AI pipeline complete! Your video is ready to
                            publish.
                          </p>
                        </div>

                        {/* Summary card */}
                        <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                          <CardTitle className="text-sm">
                            Publish Summary
                          </CardTitle>
                          <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-24 shrink-0">
                                Title
                              </span>
                              <span className="font-medium">{videoTitle}</span>
                            </div>
                            {videoDesc && (
                              <div className="flex gap-2">
                                <span className="text-muted-foreground w-24 shrink-0">
                                  Description
                                </span>
                                <span className="text-muted-foreground line-clamp-2">
                                  {videoDesc.slice(0, 100)}
                                  {videoDesc.length > 100 ? "..." : ""}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-24 shrink-0">
                                Platform
                              </span>
                              <span className="font-medium capitalize">
                                {selectedProject.platform}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-muted-foreground w-24 shrink-0">
                                Ratio
                              </span>
                              <span className="font-medium">
                                {selectedProject.screenRatio}
                              </span>
                            </div>
                          </div>
                        </div>

                        {processingStep === "upload" && (
                          <div data-ocid="pipeline.upload.loading_state">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                Publishing to {selectedProject.platform}...
                              </span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action button — hidden during auto-run (except upload step) */}
                    {active && !processing && !autoRunning && (
                      <div className="flex gap-2 pt-1">
                        {step.id === "script" ||
                        step.id === "thumbnail" ||
                        step.id === "niche" ||
                        step.id === "ratio" ? (
                          <Button
                            size="sm"
                            data-ocid={`pipeline.step.save_button.${i + 1}`}
                            onClick={() => handleStepAction(step.id)}
                          >
                            Save & Continue{" "}
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        ) : step.id === "upload" ? (
                          <Button
                            size="sm"
                            data-ocid="pipeline.upload.submit_button"
                            disabled={processingStep === "upload"}
                            onClick={handleUpload}
                            className="w-full"
                          >
                            <Upload className="w-3 h-3 mr-1" /> Publish to{" "}
                            <span className="capitalize ml-1">
                              {selectedProject.platform}
                            </span>
                          </Button>
                        ) : step.id === "review" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid="pipeline.review.edit_button"
                              onClick={() => {
                                const updated = {
                                  ...selectedProject,
                                  currentStep: "script",
                                };
                                setLocalProject(updated);
                              }}
                            >
                              <Edit3 className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              data-ocid="pipeline.review.approve_button"
                              onClick={() => handleStepAction(step.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Looks Good -
                              Continue
                            </Button>
                          </div>
                        ) : step.id === "videogen" ? null : (
                          <Button
                            size="sm"
                            data-ocid={`pipeline.step.primary_button.${i + 1}`}
                            onClick={() => handleStepAction(step.id)}
                          >
                            <Play className="w-3 h-3 mr-1" /> Analyze & Continue
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Publish button always visible when at upload step */}
                    {active && step.id === "upload" && !processing && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          data-ocid="pipeline.upload.submit_button"
                          disabled={processingStep === "upload"}
                          onClick={handleUpload}
                          className="w-full"
                        >
                          <Upload className="w-3 h-3 mr-1" /> Publish to{" "}
                          <span className="capitalize ml-1">
                            {selectedProject.platform}
                          </span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {isDone && (
          <div
            data-ocid="pipeline.complete.success_state"
            className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-display font-bold">Pipeline Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your video has been published to {selectedProject.platform}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Content Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your video creation projects
          </p>
        </div>
        <Button
          data-ocid="projects.new.open_modal_button"
          onClick={() => setNewOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !projects?.length ? (
        <div
          data-ocid="projects.list.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <Clapperboard className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-medium mb-1">No projects yet</p>
          <p className="text-sm">
            Create your first project to start the pipeline
          </p>
          <Button
            className="mt-4"
            data-ocid="projects.empty.new_button"
            onClick={() => setNewOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((p, i) => {
            const stepIndex = STEPS.findIndex((s) => s.id === p.currentStep);
            const progress =
              p.currentStep === "done"
                ? 100
                : Math.round((stepIndex / STEPS.length) * 100);
            return (
              <Card
                key={p.id}
                data-ocid={`projects.item.${i + 1}`}
                className="cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => {
                  setSelectedId(p.id);
                  setLocalProject(null);
                }}
              >
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.niche} · {p.platform} · {p.screenRatio}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          p.currentStep === "done" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {p.currentStep === "done"
                          ? "Done"
                          : (STEPS.find((s) => s.id === p.currentStep)?.label ??
                            p.currentStep)}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New project dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent data-ocid="projects.new.dialog">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                data-ocid="projects.title.input"
                placeholder="e.g. My Fitness Channel Launch"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Niche</Label>
              <Input
                data-ocid="projects.niche.input"
                placeholder="e.g. personal finance"
                value={newForm.niche}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, niche: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>
                Describe Your Idea{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                data-ocid="projects.idea.textarea"
                placeholder="e.g. A step-by-step guide on how beginners can start investing in index funds with just $100 per month..."
                value={newForm.ideaDescription}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, ideaDescription: e.target.value }))
                }
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Script Style</Label>
              <Select
                value={newForm.scriptStyle}
                onValueChange={(v) =>
                  setNewForm((f) => ({ ...f, scriptStyle: v }))
                }
              >
                <SelectTrigger data-ocid="projects.scriptstyle.select">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">📚 Educational</SelectItem>
                  <SelectItem value="short-form">⚡ Short-Form</SelectItem>
                  <SelectItem value="storytelling">📖 Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Platform</Label>
              <Select
                value={newForm.platform}
                onValueChange={(v) => {
                  const plat = PLATFORMS.find((p) => p.id === v);
                  setNewForm((f) => ({
                    ...f,
                    platform: v,
                    screenRatio: plat?.defaultRatio ?? "16:9",
                  }));
                }}
              >
                <SelectTrigger data-ocid="projects.platform.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Video Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "animation", icon: "🎨", label: "Animation" },
                  { id: "realistic", icon: "📷", label: "Realistic" },
                  { id: "cinematic", icon: "🎬", label: "Cinematic" },
                  { id: "documentary", icon: "📹", label: "Documentary" },
                  { id: "educational", icon: "📚", label: "Educational" },
                  { id: "short-form", icon: "⚡", label: "Short-Form" },
                ].map((fmt) => (
                  <button
                    type="button"
                    key={fmt.id}
                    data-ocid={`projects.format.${fmt.id}.toggle`}
                    onClick={() =>
                      setNewForm((f) => ({ ...f, videoFormat: fmt.id }))
                    }
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                      newForm.videoFormat === fmt.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-lg">{fmt.icon}</span>
                    <span>{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Screen Ratio</Label>
              <div className="flex flex-wrap gap-2">
                {RATIOS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() =>
                      setNewForm((f) => ({ ...f, screenRatio: r }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      newForm.screenRatio === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Video Type</Label>
            <div className="flex gap-2">
              {[
                { id: "single", icon: "🎬", label: "Single Video" },
                { id: "series", icon: "📺", label: "Series" },
              ].map((vt) => (
                <button
                  type="button"
                  key={vt.id}
                  data-ocid={`projects.video-type.${vt.id}.toggle`}
                  onClick={() =>
                    setNewForm((f) => ({
                      ...f,
                      videoType: vt.id as "single" | "series",
                    }))
                  }
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                    newForm.videoType === vt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{vt.icon}</span>
                  <span>{vt.label}</span>
                </button>
              ))}
            </div>
            {newForm.videoType === "series" && (
              <div className="flex items-center gap-3 mt-2">
                <Label className="text-sm shrink-0">Number of Parts</Label>
                <select
                  data-ocid="projects.series-parts.select"
                  value={newForm.seriesParts}
                  onChange={(e) =>
                    setNewForm((f) => ({
                      ...f,
                      seriesParts: Number(e.target.value),
                    }))
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} parts
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              Video Length:{" "}
              <span className="font-semibold">{newForm.videoDuration} min</span>
            </Label>
            <Slider
              data-ocid="projects.video-duration.toggle"
              min={1}
              max={60}
              step={1}
              value={[newForm.videoDuration]}
              onValueChange={([v]) =>
                setNewForm((f) => ({ ...f, videoDuration: v }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="projects.new.cancel_button"
              onClick={() => setNewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="projects.new.submit_button"
              disabled={
                !newForm.title ||
                !newForm.niche ||
                createMutation.isPending ||
                actorLoading ||
                !actor
              }
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Clapperboard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Clapperboard"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 3.9" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
