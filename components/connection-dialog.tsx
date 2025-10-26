"use client";

import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ConnectionDialogProps {
  onConnect: () => void;
  onDisconnect: () => void;
  children?: React.ReactNode;
}

export function ConnectionDialog({
  onConnect,
  onDisconnect,
  children,
}: ConnectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(() => {
    // Load saved credentials from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qdata_connection');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {
            host: "localhost",
            port: "3306",
            user: "root",
            password: "",
            database: "",
          };
        }
      }
    }
    return {
      host: "localhost",
      port: "3306",
      user: "root",
      password: "",
      database: "",
    };
  });
  const { toast } = useToast();

  const handleConnect = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/qdata/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: config.host,
          port: parseInt(config.port),
          user: config.user,
          password: config.password,
          database: config.database || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save credentials to localStorage (excluding password for security)
        localStorage.setItem('qdata_connection', JSON.stringify({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password, // In production, consider encrypting or not storing
          database: config.database,
        }));
        
        toast({
          title: "✅ Connected!",
          description: `Successfully connected to MySQL as ${config.user}`,
        });
        onConnect();
        setOpen(false);
      } else {
        toast({
          title: "❌ Connection Failed",
          description: data.error || "Could not connect to database",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to connect to database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" size="sm">
            <Database className="mr-2 h-4 w-4" />
            Connect
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-slate-800 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-white">Connect to MySQL</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter your MySQL connection details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="host" className="text-slate-300">
              Host
            </Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="localhost"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="port" className="text-slate-300">
              Port
            </Label>
            <Input
              id="port"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              placeholder="3306"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user" className="text-slate-300">
              Username
            </Label>
            <Input
              id="user"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="root"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) =>
                setConfig({ ...config, password: e.target.value })
              }
              placeholder="••••••••"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="database" className="text-slate-300">
              Database (optional)
            </Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) =>
                setConfig({ ...config, database: e.target.value })
              }
              placeholder="Leave empty to see all databases"
              className="border-slate-700 bg-slate-800 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleConnect}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
