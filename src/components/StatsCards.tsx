import { Key, Cpu, Gauge, ShieldOff } from "lucide-react";
import { Procedure, ServiceCategory } from "@/data/vehicleData";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  procedures: Procedure[];
}

const categoryConfig: Record<ServiceCategory, { icon: React.ReactNode; color: string }> = {
  'key-programming': { 
    icon: <Key className="w-5 h-5" />, 
    color: "text-primary" 
  },
  'ecu-cloning': { 
    icon: <Cpu className="w-5 h-5" />, 
    color: "text-accent" 
  },
  'dashboard': { 
    icon: <Gauge className="w-5 h-5" />, 
    color: "text-success" 
  },
  'immo-off': { 
    icon: <ShieldOff className="w-5 h-5" />, 
    color: "text-warning" 
  },
};

export function StatsCards({ procedures }: StatsCardsProps) {
  const getCategoryCount = (category: ServiceCategory) => 
    procedures.filter(p => p.category === category).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(Object.keys(categoryConfig) as ServiceCategory[]).map((category) => {
        const config = categoryConfig[category];
        const count = getCategoryCount(category);
        
        return (
          <div
            key={category}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className={cn("mb-2", config.color)}>
              {config.icon}
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {count}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {category.replace('-', ' ')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
