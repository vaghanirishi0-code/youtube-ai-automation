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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  CheckCircle2,
  CloudUpload,
  Eye,
  Loader2,
  Pencil,
  Play,
  Trash2,
  UploadCloud,
  VideoIcon,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type VideoStatus = "generating" | "review" | "ready" | "uploaded";

interface AutoVideo {
  id: string;
  title: string;
  description: string;
  niche: string;
  format: string;
  status: VideoStatus;
  progress: number;
  thumbnail: string;
  duration: number;
  parts?: number;
}

const NICHES = [
  "Tech Reviews",
  "Fitness Tips",
  "Cooking Recipes",
  "Personal Finance",
  "Travel Vlogs",
  "Gaming",
  "DIY & Crafts",
  "Mental Health",
];

const FORMATS = [
  "Animation",
  "Realistic",
  "Cinematic",
  "Documentary",
  "Educational",
  "Short-Form",
];

const PLATFORMS = ["YouTube", "Instagram", "TikTok", "Facebook"];

const SCRIPT_STYLES = ["Educational", "Short-Form", "Storytelling"];

const THUMBNAIL_GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
];

const MOCK_TITLES: Record<string, string[]> = {
  "Tech Reviews": [
    "iPhone 17 Pro MAX Review: Is It Worth It?",
    "Best Budget Laptops 2026 — Full Breakdown",
    "AI Tools That Will Replace Your Job",
    "Top 10 Gadgets You Need This Year",
    "MacBook vs Windows: Which Is Better?",
  ],
  "Fitness Tips": [
    "30-Day Six Pack Challenge: Real Results",
    "Best Pre-Workout Foods for Maximum Gains",
    "How to Lose 10 lbs in 30 Days Safely",
    "5 Morning Habits for a Fit Body",
    "Home Workout Routine — No Equipment",
  ],
  default: [
    "Top 10 Tips You Didn't Know About",
    "Complete Beginner's Guide for 2026",
    "Why Everyone Is Talking About This",
    "The Ultimate Deep Dive You Need",
    "Secrets Experts Don't Want You to Know",
  ],
};

const MOCK_DESCS: string[] = [
  "In this video, we break down everything you need to know with expert insights and real-world examples. Don't miss the tips at the end!",
  "A comprehensive look at the subject from multiple angles. We cover the pros, cons, and actionable steps you can take today.",
  "Join us as we explore this topic with data-backed research and entertaining storytelling. Like and subscribe for weekly uploads!",
  "This is the video you've been waiting for. We've compiled the best information so you don't have to search anywhere else.",
];

const MOCK_SCRIPTS: string[] = [
  "[INTRO] Hey everyone, welcome back! Today we're diving deep into a topic that's been requested by thousands of you. Buckle up because this one's going to change how you think about everything.\n\n[MAIN CONTENT] Let's start with the basics. First, you need to understand the core principles at play here. Research shows that 78% of people who apply these strategies see results within the first month...\n\n[OUTRO] That's a wrap for today! If you found this helpful, smash that like button and subscribe. Drop your questions in the comments below — I read every single one!",
  "[HOOK] Did you know that most people are doing this completely wrong? In the next few minutes, I'm going to show you the exact method experts use to get results fast.\n\n[BODY] Step one is often overlooked, but it's the foundation of everything. Without this, the other steps simply won't work as effectively...\n\n[CALL TO ACTION] Let me know in the comments which tip surprised you the most. And don't forget to share this with someone who needs to hear it!",
  "[OPENING] Welcome! Today's video is one I've been planning for months. I've done all the research so you don't have to, and the results are genuinely surprising.\n\n[CONTENT] The data we gathered from over 500 case studies reveals a clear pattern. Those who succeed share three key habits that we'll break down one by one...\n\n[CLOSE] Thanks for watching all the way to the end — you're one of the dedicated ones. Subscribe for weekly videos every Tuesday!",
];

function getTitles(niche: string): string[] {
  return MOCK_TITLES[niche] ?? MOCK_TITLES.default;
}

let videoCounter = 0;

function makeVideo(
  niche: string,
  format: string,
  duration: number,
  parts?: number,
): AutoVideo {
  videoCounter++;
  const titles = getTitles(niche);
  const title = titles[videoCounter % titles.length];
  const desc = MOCK_DESCS[videoCounter % MOCK_DESCS.length];
  const gradient =
    THUMBNAIL_GRADIENTS[videoCounter % THUMBNAIL_GRADIENTS.length];
  return {
    id: `auto-${Date.now()}-${videoCounter}`,
    title,
    description: desc,
    niche,
    format,
    status: "generating",
    progress: 0,
    thumbnail: gradient,
    duration,
    parts,
  };
}

export function Automation() {
  const [enabled, setEnabled] = useState(false);
  const [niche, setNiche] = useState("Tech Reviews");
  const [videosPerDay, setVideosPerDay] = useState([3]);
  const [platform, setPlatform] = useState("YouTube");
  const [format, setFormat] = useState("Cinematic");
  const [scriptStyle, setScriptStyle] = useState("Educational");
  const [videos, setVideos] = useState<AutoVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customNiche, setCustomNiche] = useState("");
  const [videoType, setVideoType] = useState<"single" | "series">("single");
  const [seriesParts, setSeriesParts] = useState([3]);
  const [videoDuration, setVideoDuration] = useState([10]);

  // Review modal state
  const [reviewVideo, setReviewVideo] = useState<AutoVideo | null>(null);

  // Edit dialog state
  const [editVideo, setEditVideo] = useState<AutoVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const activeNiche = customNiche.trim() || niche;

  const totalGenerated = videos.length;
  const readyToUpload = videos.filter((v) => v.status === "ready").length;
  const uploaded = videos.filter((v) => v.status === "uploaded").length;

  const openReview = (video: AutoVideo) => {
    setReviewVideo(video);
  };

  const openEdit = (video: AutoVideo) => {
    setEditVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description);
  };

  const saveEdit = () => {
    if (!editVideo) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === editVideo.id
          ? { ...v, title: editTitle, description: editDesc }
          : v,
      ),
    );
    setEditVideo(null);
    toast.success("Video updated successfully!");
  };

  const generateVideos = useCallback(async () => {
    if (!enabled) {
      toast.error("Enable automation first to generate videos.");
      return;
    }
    setIsGenerating(true);
    const count = videosPerDay[0];
    const batch: AutoVideo[] = Array.from({ length: count }, () =>
      makeVideo(
        activeNiche,
        format,
        videoDuration[0],
        videoType === "series" ? seriesParts[0] : undefined,
      ),
    );
    setVideos((prev) => [...batch, ...prev]);

    for (const video of batch) {
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, progress: p } : v)),
        );
      }
      await new Promise((r) => setTimeout(r, 100));
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, status: "review", progress: 100 } : v,
        ),
      );
    }

    setIsGenerating(false);
    toast.success(
      `${count} video${count > 1 ? "s" : ""} generated and ready for review!`,
    );
  }, [
    enabled,
    videosPerDay,
    activeNiche,
    format,
    videoDuration,
    videoType,
    seriesParts,
  ]);

  const markReady = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "ready" } : v)),
    );
    setReviewVideo(null);
    toast.success("Video approved and marked as Ready to Upload!");
  };

  const uploadVideo = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "uploaded" } : v)),
    );
    toast.success(`Video uploaded to ${platform}!`);
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success("Video deleted.");
  };

  const statusBadge = (status: VideoStatus) => {
    switch (status) {
      case "generating":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Generating…
          </Badge>
        );
      case "review":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Under Review
          </Badge>
        );
      case "ready":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Ready to Upload
          </Badge>
        );
      case "uploaded":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Uploaded
          </Badge>
        );
    }
  };

  const mockScript =
    MOCK_SCRIPTS[videoCounter % MOCK_SCRIPTS.length] ?? MOCK_SCRIPTS[0];

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Automation Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate unlimited videos automatically — review and upload when
            ready.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="automation-switch" className="text-sm font-medium">
            {enabled ? "Automation ON" : "Automation OFF"}
          </Label>
          <Switch
            id="automation-switch"
            data-ocid="automation.switch"
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {totalGenerated}
              </p>
              <p className="text-xs text-muted-foreground">Total Generated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{readyToUpload}</p>
              <p className="text-xs text-muted-foreground">Ready to Upload</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{uploaded}</p>
              <p className="text-xs text-muted-foreground">
                Uploaded This Week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <Card className="border-border/50 bg-card/80 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Niche / Topic
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger
                  data-ocid="automation.niche.select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                data-ocid="automation.niche.input"
                placeholder="Or type a custom niche…"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                className="h-9 text-sm mt-1.5"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Videos per batch:{" "}
                <span className="text-foreground font-semibold">
                  {videosPerDay[0]}
                </span>
              </Label>
              <Slider
                data-ocid="automation.videos-per-day.toggle"
                min={1}
                max={10}
                step={1}
                value={videosPerDay}
                onValueChange={setVideosPerDay}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger
                  data-ocid="automation.platform.select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Video Format
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger
                  data-ocid="automation.format.select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Script Style
              </Label>
              <Select value={scriptStyle} onValueChange={setScriptStyle}>
                <SelectTrigger
                  data-ocid="automation.script-style.select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCRIPT_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Video Type
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="automation.video-type.single.toggle"
                  onClick={() => setVideoType("single")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    videoType === "single"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  🎬 Single Video
                </button>
                <button
                  type="button"
                  data-ocid="automation.video-type.series.toggle"
                  onClick={() => setVideoType("series")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    videoType === "series"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  📺 Series
                </button>
              </div>
              {videoType === "series" && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-muted-foreground">
                    Parts:{" "}
                    <span className="text-foreground font-semibold">
                      {seriesParts[0]} parts
                    </span>
                  </Label>
                  <Slider
                    data-ocid="automation.series-parts.toggle"
                    min={2}
                    max={10}
                    step={1}
                    value={seriesParts}
                    onValueChange={setSeriesParts}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Video Length:{" "}
                <span className="text-foreground font-semibold">
                  {videoDuration[0]} min
                </span>
              </Label>
              <Slider
                data-ocid="automation.video-duration.toggle"
                min={1}
                max={60}
                step={1}
                value={videoDuration}
                onValueChange={setVideoDuration}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>60 min</span>
              </div>
            </div>

            <Button
              data-ocid="automation.generate.primary_button"
              className="w-full gap-2"
              disabled={isGenerating || !enabled}
              onClick={generateVideos}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Generate {videosPerDay[0]} Video
                  {videosPerDay[0] > 1 ? "s" : ""}
                </>
              )}
            </Button>

            {!enabled && (
              <p className="text-xs text-muted-foreground text-center">
                Toggle automation ON to start generating.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Video queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Generated Videos Queue
            </h2>
            {videos.length > 0 && (
              <Badge variant="secondary">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {videos.length === 0 && (
            <div
              data-ocid="automation.videos.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl"
            >
              <Bot className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No videos yet</p>
              <p className="text-xs mt-1">
                Enable automation and click Generate to create videos.
              </p>
            </div>
          )}

          <div className="space-y-3" data-ocid="automation.videos.list">
            <AnimatePresence>
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                  data-ocid={`automation.videos.item.${idx + 1}`}
                >
                  <Card className="border-border/50 bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div
                          className={`w-28 h-16 rounded-lg bg-gradient-to-br ${video.thumbnail} flex items-center justify-center shrink-0 overflow-hidden`}
                        >
                          <p className="text-white text-[9px] font-bold text-center px-1 leading-tight line-clamp-3">
                            {video.title}
                          </p>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight line-clamp-1">
                              {video.title}
                            </p>
                            {statusBadge(video.status)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {video.format}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {video.niche}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {video.duration} min
                            </Badge>
                            {video.parts && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {video.parts} Parts
                              </Badge>
                            )}
                          </div>

                          {video.status === "generating" && (
                            <div className="pt-1">
                              <Progress
                                value={video.progress}
                                className="h-1.5"
                              />
                            </div>
                          )}

                          {video.status !== "generating" && (
                            <div className="flex items-center gap-2 pt-1">
                              {video.status === "review" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1"
                                  data-ocid={`automation.videos.open_modal_button.${idx + 1}`}
                                  onClick={() => openReview(video)}
                                >
                                  <Eye className="w-3 h-3" /> Review
                                </Button>
                              )}
                              {video.status === "ready" && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                                  data-ocid={`automation.videos.primary_button.${idx + 1}`}
                                  onClick={() => uploadVideo(video.id)}
                                >
                                  <CloudUpload className="w-3 h-3" /> Upload to{" "}
                                  {platform}
                                </Button>
                              )}
                              {video.status === "uploaded" && (
                                <Badge className="h-7 text-xs gap-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Uploaded
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                data-ocid={`automation.videos.edit_button.${idx + 1}`}
                                onClick={() => openEdit(video)}
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                                data-ocid={`automation.videos.delete_button.${idx + 1}`}
                                onClick={() => deleteVideo(video.id)}
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog
        open={!!reviewVideo}
        onOpenChange={(open) => !open && setReviewVideo(null)}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="automation.review.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Review Video
            </DialogTitle>
          </DialogHeader>

          {reviewVideo && (
            <div className="space-y-4">
              {/* Thumbnail */}
              <div
                className={`w-full h-48 rounded-xl bg-gradient-to-br ${reviewVideo.thumbnail} flex items-center justify-center overflow-hidden`}
              >
                <p className="text-white text-sm font-bold text-center px-4 leading-snug drop-shadow-md">
                  {reviewVideo.title}
                </p>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm leading-snug">
                  {reviewVideo.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reviewVideo.description}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[11px]">
                  {reviewVideo.format}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {reviewVideo.niche}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {reviewVideo.duration} min
                </Badge>
                {reviewVideo.parts && (
                  <Badge variant="outline" className="text-[11px]">
                    {reviewVideo.parts} Parts
                  </Badge>
                )}
                <Badge className="text-[11px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  SEO: 87/100
                </Badge>
              </div>

              {/* Script preview */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Script Preview
                </Label>
                <div className="bg-muted/40 rounded-lg p-3 max-h-36 overflow-y-auto">
                  <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">
                    {mockScript}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              data-ocid="automation.review.cancel_button"
              onClick={() => setReviewVideo(null)}
            >
              Cancel
            </Button>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              data-ocid="automation.review.confirm_button"
              onClick={() => reviewVideo && markReady(reviewVideo.id)}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Mark Ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editVideo}
        onOpenChange={(open) => !open && setEditVideo(null)}
      >
        <DialogContent className="max-w-md" data-ocid="automation.edit.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Edit Video
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input
                data-ocid="automation.edit.input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter video title…"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                data-ocid="automation.edit.textarea"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Enter video description…"
                className="text-sm min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              data-ocid="automation.edit.cancel_button"
              onClick={() => setEditVideo(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="automation.edit.save_button"
              onClick={saveEdit}
              disabled={!editTitle.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="pt-4 text-center text-xs text-muted-foreground border-t border-border/30">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
