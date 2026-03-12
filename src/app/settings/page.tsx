"use client";

import { useState } from "react";
import { Moon, Sun, Download, Trash2, Sparkles, User, LogOut, Pencil, Check, X } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useCompletions } from "@/hooks/use-completions";
import { useHabits } from "@/hooks/use-habits";

function SettingsContent() {
  const { user, signOut, updateDisplayName } = useAuth();
  const { habits, loadDemoData, clearAllHabits } = useHabits(user?.uid);
  const { completions } = useCompletions(user?.uid);
  const { theme, setTheme } = useTheme();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIsSavingName(true);
    try {
      await updateDisplayName(trimmed);
      toast.success("Name updated!");
      setIsEditingName(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleExport = () => {
    const data = {
      habits,
      completions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streakflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await loadDemoData();
      toast.success("Demo data loaded!");
    } catch {
      toast.error("Failed to load demo data");
    } finally {
      setIsLoadingDemo(false);
      setShowDemoDialog(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearAllHabits();
      toast.success("All data cleared!");
    } catch {
      toast.error("Failed to clear data");
    } finally {
      setIsClearing(false);
      setShowClearDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm overflow-hidden flex-shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.displayName?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        className="h-9 w-36 sm:w-48"
                        maxLength={50}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setIsEditingName(false);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleSaveName}
                        disabled={isSavingName || !newName.trim()}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setIsEditingName(false)}
                        disabled={isSavingName}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium">{user?.displayName}</p>
                      <button
                        onClick={() => {
                          setNewName(user?.displayName || "");
                          setIsEditingName(true);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}{" "}
              Theme
            </CardTitle>
            <CardDescription>
              Choose your preferred appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Demo Data
            </CardTitle>
            <CardDescription>
              Load sample habits to explore the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDemoDialog(true)}
            >
              Load Demo Data
            </Button>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Data
            </CardTitle>
            <CardDescription>
              Download your habits as a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Download Backup
            </Button>
          </CardContent>
        </Card>

        {/* Clear Data */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Clear All Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your habits and completion history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearDialog(true)}
            >
              Clear Everything
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clear confirmation */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your habits and completion
              history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isClearing}
            >
              {isClearing ? "Clearing..." : "Clear Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demo confirmation */}
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load demo data?</DialogTitle>
            <DialogDescription>
              This will add sample habits and completion history to your
              account. Your existing data will not be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDemoDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLoadDemo} disabled={isLoadingDemo}>
              {isLoadingDemo ? "Loading..." : "Load Demo Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
