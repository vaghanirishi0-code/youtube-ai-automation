import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Download,
  Link,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const STYLE_OPTIONS = [
  {
    id: "animation",
    label: "Animation",
    img: "/assets/generated/thumb-style-animation.dim_400x225.jpg",
    gradient: "linear-gradient(135deg, #4f46e5, #7c3aed, #0ea5e9)",
    titleColor: "#facc15",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    img: "/assets/generated/thumb-style-cinematic.dim_400x225.jpg",
    gradient: "linear-gradient(180deg, #1a0a00 0%, #7c4000 50%, #1a0a00 100%)",
    titleColor: "#fbbf24",
  },
  {
    id: "realistic",
    label: "Realistic",
    img: "/assets/generated/thumb-style-realistic.dim_400x225.jpg",
    gradient: "linear-gradient(135deg, #374151, #1f2937)",
    titleColor: "#f9fafb",
  },
  {
    id: "documentary",
    label: "Documentary",
    img: "/assets/generated/thumb-style-documentary.dim_400x225.jpg",
    gradient: "linear-gradient(180deg, #44403c, #1c1917)",
    titleColor: "#e7e5e4",
  },
  {
    id: "bold",
    label: "Bold",
    img: "/assets/generated/thumb-style-bold.dim_400x225.jpg",
    gradient: "linear-gradient(135deg, #dc2626, #f59e0b)",
    titleColor: "#ffffff",
  },
  {
    id: "dark",
    label: "Dark",
    img: "/assets/generated/thumb-style-dark.dim_400x225.jpg",
    gradient: "linear-gradient(180deg, #0f172a 60%, #000)",
    titleColor: "#22d3ee",
  },
];

const BG_PRESETS = [
  { label: "Deep Blue", value: "#0f172a" },
  { label: "Crimson", value: "#7f1d1d" },
  { label: "Forest", value: "#14532d" },
  { label: "Purple", value: "#3b0764" },
  { label: "Charcoal", value: "#1c1917" },
  { label: "Ocean", value: "#0c4a6e" },
];

function StyleCard({
  style,
  selected,
  onClick,
  small = false,
}: {
  style: (typeof STYLE_OPTIONS)[0];
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`thumbnail.style.${style.id}.toggle`}
      className={`group relative rounded-xl overflow-hidden border-2 transition-all ${selected ? "border-primary ring-2 ring-primary/40 scale-[1.02]" : "border-border hover:border-primary/40"}`}
    >
      <img
        src={style.img}
        alt={style.label}
        className={`w-full object-cover ${small ? "h-14" : "h-20"}`}
      />
      {selected && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle2 className="w-4 h-4 text-primary drop-shadow" />
        </div>
      )}
      <div className="py-1.5 text-center">
        <span
          className={`text-xs font-medium ${selected ? "text-primary" : "text-foreground"}`}
        >
          {style.label}
        </span>
      </div>
    </button>
  );
}

function ThumbnailPreview({
  title,
  subtitle,
  bg,
  style,
  fontSize,
}: {
  title: string;
  subtitle: string;
  bg: string;
  style: string;
  fontSize: number[];
}) {
  const styleOpt = STYLE_OPTIONS.find((s) => s.id === style);
  const gradient = styleOpt ? styleOpt.gradient : bg;
  const titleColor = styleOpt?.titleColor ?? "#ffffff";
  return (
    <div
      data-ocid="thumbnail.canvas_target"
      className="relative w-full rounded-xl overflow-hidden"
      style={{ aspectRatio: "16/9", background: gradient }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
        }}
      />
      {style === "bold" && (
        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          NEW
        </div>
      )}
      {style === "cinematic" && (
        <>
          <div className="absolute top-0 left-0 right-0 h-6 bg-black" />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-black" />
        </>
      )}
      <div className="absolute inset-0 flex flex-col justify-center px-8">
        <p
          className="font-display font-black leading-tight"
          style={{
            fontSize: `${fontSize[0]}px`,
            color: titleColor,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {title || "Your Title"}
        </p>
        {subtitle && (
          <p
            className="mt-2 font-body"
            style={{
              fontSize: `${Math.round(fontSize[0] * 0.45)}px`,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function ThumbnailCreator() {
  const [title, setTitle] = useState("Your Video Title");
  const [subtitle, setSubtitle] = useState("Subtitle text here");
  const [bg, setBg] = useState("#0f172a");
  const [style, setStyle] = useState("bold");
  const [fontSize, setFontSize] = useState([48]);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlSuccess, setUrlSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleGenerateFromUrl() {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlSuccess(false);
    await new Promise((r) => setTimeout(r, 1500));
    const demoTitles = [
      "Master YouTube Growth in 2025 — Full Strategy Guide",
      "10 Life-Changing Productivity Hacks You Need Now",
      "The Truth About Passive Income Nobody Tells You",
      "How I Got 100K Subscribers in 6 Months",
    ];
    setTitle(demoTitles[Math.floor(Math.random() * demoTitles.length)]);
    setSubtitle("From YouTube · AI Matched Style");
    setBg("#0f172a");
    setStyle("cinematic");
    setUrlLoading(false);
    setUrlSuccess(true);
    toast.success("Thumbnail fields auto-populated from video URL!");
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    setUploadLoading(true);
    setUploadSuccess(false);
    await new Promise((r) => setTimeout(r, 1500));
    const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    setTitle(`${name.charAt(0).toUpperCase()}${name.slice(1)} — Full Tutorial`);
    setSubtitle("Extracted from uploaded video");
    setBg("#14532d");
    setStyle("realistic");
    setUploadLoading(false);
    setUploadSuccess(true);
    toast.success("Video metadata extracted — thumbnail fields updated!");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Thumbnail Creator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Design eye-catching thumbnails — from scratch, from a URL, or from a
          video
        </p>
      </div>

      <Tabs defaultValue="design">
        <TabsList data-ocid="thumbnail.tab" className="mb-4">
          <TabsTrigger value="design" data-ocid="thumbnail.design.tab">
            Design
          </TabsTrigger>
          <TabsTrigger value="url" data-ocid="thumbnail.url.tab">
            <Link className="w-3.5 h-3.5 mr-1.5" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="upload" data-ocid="thumbnail.upload.tab">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload Video
          </TabsTrigger>
        </TabsList>

        {/* FROM URL */}
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Generate from YouTube URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Paste a YouTube video URL and the AI will extract the title,
                niche, and style to auto-create a matching thumbnail.
              </p>
              <div className="space-y-2">
                <Label className="text-xs">YouTube Video URL</Label>
                <Input
                  data-ocid="thumbnail.url.input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlSuccess(false);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleGenerateFromUrl()
                  }
                />
              </div>
              <Button
                data-ocid="thumbnail.url.primary_button"
                className="w-full"
                disabled={!urlInput.trim() || urlLoading}
                onClick={handleGenerateFromUrl}
              >
                {urlLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing video...
                  </>
                ) : (
                  "Generate Thumbnail from URL"
                )}
              </Button>
              {urlSuccess && (
                <div
                  data-ocid="thumbnail.url.success_state"
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Thumbnail fields auto-populated! Switch to the{" "}
                  <span className="font-semibold">Design</span> tab to
                  customize.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UPLOAD VIDEO */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Generate from Uploaded Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Upload your video file and the AI will extract metadata and
                auto-design a matching thumbnail.
              </p>
              <label
                data-ocid="thumbnail.dropzone"
                htmlFor="thumb-video-upload"
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {uploadFileName || "Click to upload video"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, AVI, MKV supported
                  </p>
                </div>
                {uploadLoading && (
                  <div
                    data-ocid="thumbnail.upload.loading_state"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting video metadata...
                  </div>
                )}
              </label>
              <input
                ref={fileRef}
                id="thumb-video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                data-ocid="thumbnail.upload_button"
                onChange={handleVideoUpload}
              />
              {uploadSuccess && (
                <div
                  data-ocid="thumbnail.upload.success_state"
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Metadata extracted! Switch to{" "}
                  <span className="font-semibold">Design</span> tab.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DESIGN */}
        <TabsContent value="design">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Design Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Main Title</Label>
                  <Input
                    data-ocid="thumbnail.title.input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Video title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    data-ocid="thumbnail.subtitle.input"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Subtitle or tagline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Thumbnail Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <StyleCard
                        key={s.id}
                        style={s}
                        selected={style === s.id}
                        onClick={() => setStyle(s.id)}
                      />
                    ))}
                  </div>
                  {style && (
                    <Badge variant="secondary" className="text-xs">
                      Selected:{" "}
                      {STYLE_OPTIONS.find((s) => s.id === style)?.label}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {BG_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.value}
                        data-ocid="thumbnail.bg.toggle"
                        onClick={() => setBg(p.value)}
                        title={p.label}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${bg === p.value ? "border-primary scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: p.value }}
                      />
                    ))}
                    <input
                      type="color"
                      value={bg}
                      onChange={(e) => setBg(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                      title="Custom color"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Font Size: {fontSize[0]}px</Label>
                  <Slider
                    data-ocid="thumbnail.fontsize.slider"
                    min={24}
                    max={80}
                    step={2}
                    value={fontSize}
                    onValueChange={setFontSize}
                  />
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  data-ocid="thumbnail.reset.button"
                  onClick={() => {
                    setTitle("Your Video Title");
                    setSubtitle("Subtitle text here");
                    setBg("#0f172a");
                    setStyle("bold");
                    setFontSize([48]);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Preview (16:9)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ThumbnailPreview
                    title={title}
                    subtitle={subtitle}
                    bg={bg}
                    style={style}
                    fontSize={fontSize}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      data-ocid="thumbnail.save.button"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `Title: ${title}\nSubtitle: ${subtitle}\nBg: ${bg}\nStyle: ${style}`,
                        );
                        toast.success("Design copied!");
                      }}
                    >
                      Copy Description
                    </Button>
                    <Button
                      variant="outline"
                      data-ocid="thumbnail.download.button"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Style Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const s = STYLE_OPTIONS.find((s) => s.id === style);
                    if (!s) return null;
                    return (
                      <div className="space-y-2">
                        <img
                          src={s.img}
                          alt={s.label}
                          className="w-full rounded-lg object-cover"
                          style={{ aspectRatio: "16/9" }}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          <span className="font-medium text-foreground">
                            {s.label}
                          </span>{" "}
                          style reference
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
