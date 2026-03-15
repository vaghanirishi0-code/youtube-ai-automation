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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SocialAccount } from "../backend";
import { useActor } from "../hooks/useActor";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", color: "bg-red-500", emoji: "▶" },
  { id: "instagram", label: "Instagram", color: "bg-pink-500", emoji: "📷" },
  { id: "facebook", label: "Facebook", color: "bg-blue-600", emoji: "f" },
  { id: "tiktok", label: "TikTok", color: "bg-black", emoji: "♪" },
  { id: "twitter", label: "Twitter / X", color: "bg-sky-500", emoji: "✕" },
];

export function SocialAccounts() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    platform: "",
    accountName: "",
    handle: "",
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => actor!.listSocialAccounts(),
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const account: SocialAccount = {
        id: crypto.randomUUID(),
        platform: form.platform,
        accountName: form.accountName,
        handle: form.handle,
        connected: true,
      };
      await actor!.createSocialAccount(account);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setOpen(false);
      setForm({ platform: "", accountName: "", handle: "" });
      toast.success("Account connected");
    },
    onError: () => toast.error("Failed to add account"),
  });

  const toggleMutation = useMutation({
    mutationFn: async (account: SocialAccount) => {
      await actor!.updateSocialAccount({
        ...account,
        connected: !account.connected,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await actor!.deleteSocialAccount(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account removed");
    },
  });

  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Social Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your social media platforms
          </p>
        </div>
        <Button
          data-ocid="accounts.add.open_modal_button"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Connect Account
        </Button>
      </div>

      {/* Platform overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PLATFORMS.map((p) => {
          const count =
            accounts?.filter((a) => a.platform === p.id).length ?? 0;
          return (
            <Card key={p.id} className="text-center p-3">
              <div
                className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center mx-auto mb-2 text-white text-sm font-bold`}
              >
                {p.emoji}
              </div>
              <p className="text-xs font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">
                {count} account{count !== 1 ? "s" : ""}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Account list */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !accounts?.length ? (
          <div
            data-ocid="accounts.list.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No accounts connected yet</p>
          </div>
        ) : (
          accounts.map((account, i) => {
            const platform = getPlatform(account.platform);
            return (
              <Card key={account.id} data-ocid={`accounts.item.${i + 1}`}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${platform?.color ?? "bg-muted"} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {platform?.emoji ?? "?"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {account.accountName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{account.handle} ·{" "}
                        {platform?.label ?? account.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={account.connected ? "default" : "secondary"}
                    >
                      {account.connected ? "Connected" : "Disconnected"}
                    </Badge>
                    <Switch
                      data-ocid={`accounts.connected.switch.${i + 1}`}
                      checked={account.connected}
                      onCheckedChange={() => toggleMutation.mutate(account)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`accounts.delete_button.${i + 1}`}
                      onClick={() => deleteMutation.mutate(account.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add account dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="accounts.add.dialog">
          <DialogHeader>
            <DialogTitle>Connect Social Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
              >
                <SelectTrigger data-ocid="accounts.platform.select">
                  <SelectValue placeholder="Select platform" />
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
              <Label>Account Name</Label>
              <Input
                data-ocid="accounts.name.input"
                placeholder="e.g. My YouTube Channel"
                value={form.accountName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, accountName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Handle / Username</Label>
              <Input
                data-ocid="accounts.handle.input"
                placeholder="e.g. mychannel"
                value={form.handle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, handle: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="accounts.add.cancel_button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="accounts.add.submit_button"
              disabled={
                !form.platform ||
                !form.accountName ||
                !form.handle ||
                addMutation.isPending
              }
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
