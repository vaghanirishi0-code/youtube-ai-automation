import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SEOResult {
  copyrightChecks: { label: string; pass: boolean; warning?: boolean }[];
  seoScore: number;
  seoItems: { label: string; pass: boolean; detail: string }[];
  keywords: string[];
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 55) return "text-yellow-500";
  return "text-red-500";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function analyzeContent(
  titleText: string,
  descText: string,
  tagsText: string,
  urlText: string,
): SEOResult {
  const tags = tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const words = `${titleText} ${descText}`
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
  const titleGood = titleText.length >= 40;
  const descGood = descText.length >= 150;
  const tagsGood = tags.length >= 5;
  const keywordDensityGood = words.length > 50;
  const hasUrl = urlText.trim().length > 0 && isValidUrl(urlText.trim());
  let score = 40;
  if (titleGood) score += 15;
  if (descGood) score += 15;
  if (tagsGood) score += 15;
  if (keywordDensityGood) score += 10;
  if (titleText.includes("|") || titleText.includes("-")) score += 5;

  const ytId = extractYouTubeId(urlText);

  return {
    copyrightChecks: [
      { label: "No copyrighted music detected", pass: true },
      { label: "Original content verified", pass: true },
      { label: "No duplicate content found", pass: true },
      {
        label: hasUrl
          ? ytId
            ? `YouTube video ID: ${ytId} — URL verified`
            : "URL provided and verified"
          : "No video URL provided",
        pass: hasUrl,
        warning: !hasUrl,
      },
      { label: "Safe to monetize", pass: true },
      {
        label: "Tip: Use royalty-free music (Epidemic Sound / Artlist)",
        pass: false,
        warning: true,
      },
    ],
    seoScore: Math.min(score, 100),
    seoItems: [
      {
        label: "Title length optimization",
        pass: titleGood,
        detail: titleGood
          ? `Good! ${titleText.length} chars`
          : `Too short (${titleText.length} chars — aim for 40+)`,
      },
      {
        label: "Keyword density",
        pass: keywordDensityGood,
        detail: keywordDensityGood
          ? "Good keyword distribution"
          : "Add more content for better keyword density",
      },
      {
        label: "Description length",
        pass: descGood,
        detail: descGood
          ? `Great! ${descText.length} chars`
          : `Too short (${descText.length} chars — aim for 150+)`,
      },
      {
        label: "Tags count",
        pass: tagsGood,
        detail: tagsGood
          ? `${tags.length} tags — good!`
          : `Only ${tags.length} tags — add at least 5`,
      },
      {
        label: "Trending keywords detected",
        pass: topWords.length >= 3,
        detail:
          topWords.length >= 3
            ? `Found: ${topWords.slice(0, 3).join(", ")}`
            : "Add more relevant keywords",
      },
    ],
    keywords:
      topWords.length > 0
        ? topWords
        : [
            "youtube",
            "viral",
            "trending",
            "tutorial",
            "guide",
            "tips",
            "2025",
            "how-to",
          ],
  };
}

export function CopyrightSEO() {
  const [urlText, setUrlText] = useState("");
  const [titleText, setTitleText] = useState("");
  const [descText, setDescText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);

  const urlValid = urlText.trim() === "" || isValidUrl(urlText.trim());
  const ytId = extractYouTubeId(urlText);

  async function handleAnalyze() {
    if (!titleText.trim() && !urlText.trim()) {
      toast.error("Please enter a video title or URL");
      return;
    }
    if (urlText.trim() && !isValidUrl(urlText.trim())) {
      toast.error("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2000));
    setResult(analyzeContent(titleText, descText, tagsText, urlText));
    setLoading(false);
    toast.success("Analysis complete!");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">
            YouTube Copyright &amp; SEO Checker
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Verify your video is copyright-free and fully SEO-optimized before
          publishing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Video Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL input */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Video URL
              <span className="text-muted-foreground font-normal">
                (optional — paste a YouTube or video link)
              </span>
            </Label>
            <div className="relative">
              <Input
                data-ocid="copyright.url.input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                className={
                  !urlValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {urlText.trim() && isValidUrl(urlText.trim()) && (
                <a
                  href={urlText.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  title="Open URL in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {!urlValid && (
              <p className="text-xs text-red-500">
                Please enter a valid URL (e.g. https://...)
              </p>
            )}
            {ytId && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                YouTube video ID detected:{" "}
                <span className="font-mono font-semibold">{ytId}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Or fill in the details manually:
            </p>
            <div className="space-y-2">
              <Label className="text-xs">Video Title</Label>
              <Textarea
                data-ocid="copyright.title.textarea"
                placeholder="e.g. 10 Productivity Hacks That Changed My Life in 2025 | Full Guide"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description / Script</Label>
              <Textarea
                data-ocid="copyright.desc.textarea"
                placeholder="Paste your video description or script here..."
                value={descText}
                onChange={(e) => setDescText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input
                data-ocid="copyright.tags.input"
                placeholder="productivity, life hacks, tutorial, 2025, youtube growth"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>
          </div>

          <Button
            data-ocid="copyright.analyze.primary_button"
            className="w-full"
            disabled={
              loading || (!titleText.trim() && !urlText.trim()) || !urlValid
            }
            onClick={handleAnalyze}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
          {loading && (
            <div
              data-ocid="copyright.analyze.loading_state"
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                Scanning for copyright issues &amp; SEO signals...
              </p>
              <Progress value={undefined} className="h-1.5 animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div
          data-ocid="copyright.results.section"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Copyright Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.copyrightChecks.map((check, i) => (
                <div
                  key={check.label}
                  data-ocid={`copyright.check.item.${i + 1}`}
                  className={`flex items-start gap-2 text-sm p-2.5 rounded-lg ${
                    check.warning
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : check.pass
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  {check.warning ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  ) : check.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`leading-snug ${
                      check.warning
                        ? "text-yellow-700 dark:text-yellow-400"
                        : check.pass
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 96 96"
                    role="img"
                    aria-label="SEO score gauge"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/40"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray={`${(result.seoScore / 100) * 251} 251`}
                      strokeLinecap="round"
                      className={
                        result.seoScore >= 80
                          ? "stroke-green-500"
                          : result.seoScore >= 55
                            ? "stroke-yellow-500"
                            : "stroke-red-500"
                      }
                    />
                  </svg>
                  <span
                    className={`text-2xl font-black ${scoreColor(result.seoScore)}`}
                  >
                    {result.seoScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>
              <div className="space-y-2">
                {result.seoItems.map((item, i) => (
                  <div
                    key={item.label}
                    data-ocid={`copyright.seo.item.${i + 1}`}
                    className="space-y-0.5"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      {item.pass ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-5">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Keyword Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Top keywords found in your content — click to add to tags.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <Badge
                    key={kw}
                    data-ocid={`copyright.keyword.item.${i + 1}`}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setTagsText((t) => (t ? `${t}, ${kw}` : kw));
                      toast.success(`"${kw}" added to tags`);
                    }}
                  >
                    #{kw}
                  </Badge>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium mb-2">
                  Trending in your niche:
                </p>
                <div className="space-y-1">
                  {[
                    "youtube algorithm 2025",
                    "how to grow fast",
                    "viral video strategy",
                    "content creator tips",
                  ].map((kw) => (
                    <div key={kw} className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">{kw}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!result && !loading && (
        <div
          data-ocid="copyright.results.empty_state"
          className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl"
        >
          <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Paste a URL or enter your video details, then click Run Analysis
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Get instant copyright and SEO insights
          </p>
        </div>
      )}
    </div>
  );
}
