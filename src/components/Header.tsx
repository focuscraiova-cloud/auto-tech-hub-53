import { Car, Database, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Auto<span className="text-primary">Tech</span> Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Automotive Technician Database
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4" />
              <span className="font-mono">6 Makes • 8 Models</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
