import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Loader2, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

function generateResults(query: string) {
  const q = query.toLowerCase();
  const seed = q.charCodeAt(0) + q.length;
  const score = (seed * 13) % 100;
  const competitionScore = 20 + (score % 60);
  const viewBase = 10 + (seed % 90);
  return {
    competition:
      competitionScore < 35 ? "Low" : competitionScore < 65 ? "Medium" : "High",
    competitionScore,
    estimatedViews: `${viewBase}K–${viewBase * 5}K`,
    keywords: [
      `best ${query} tips`,
      `${query} for beginners`,
      `how to ${query}`,
      `${query} tutorial 2024`,
      `${query} mistakes to avoid`,
      `${query} complete guide`,
    ],
    ideas: [
      `Top 10 ${query} Strategies That Work`,
      `I Tried ${query} for 30 Days - Here's What Happened`,
      `${query} Masterclass for Beginners`,
      `Why Most People Fail at ${query}`,
      `The Ultimate ${query} Blueprint`,
    ],
  };
}

export function NicheResearch({
  onStartProject,
}: { onStartProject: (niche?: string) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReturnType<
    typeof generateResults
  > | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 1800));
    const res = generateResults(query.trim());
    setResults(res);
    setHistory((h) =>
      [query.trim(), ...h.filter((x) => x !== query.trim())].slice(0, 8),
    );
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Niche Research</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover profitable niches for your YouTube channel
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              data-ocid="niche.search.input"
              placeholder="Enter a niche topic, e.g. 'personal finance', 'fitness for women'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              data-ocid="niche.search.button"
              onClick={handleSearch}
              disabled={!query.trim() || loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">
                {loading ? "Analyzing..." : "Research"}
              </span>
            </Button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {history.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => {
                    setQuery(h);
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div data-ocid="niche.analysis.loading_state" className="space-y-4">
          {[
            "Scanning search trends...",
            "Analyzing competition...",
            "Finding keyword opportunities...",
          ].map((msg) => (
            <Card key={msg}>
              <CardContent className="py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{msg}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div data-ocid="niche.results.section" className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Competition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-lg">
                    {results.competition}
                  </span>
                  <Badge
                    variant={
                      results.competition === "Low"
                        ? "default"
                        : results.competition === "Medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {results.competitionScore}/100
                  </Badge>
                </div>
                <Progress value={results.competitionScore} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Est. Views / Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {results.estimatedViews}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Opportunity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display font-bold text-lg">
                  {100 - results.competitionScore}/100
                </p>
                <Button
                  data-ocid="niche.use_niche.button"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onStartProject(query)}
                >
                  Use this Niche <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Suggested Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.keywords.map((k) => (
                  <Badge key={k} variant="outline" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Video Ideas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.ideas.map((idea, i) => (
                <div
                  key={idea}
                  data-ocid={`niche.idea.item.${i + 1}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40"
                >
                  <span className="text-sm">{idea}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid={`niche.idea.use_button.${i + 1}`}
                    onClick={() => onStartProject(query)}
                  >
                    Use <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
