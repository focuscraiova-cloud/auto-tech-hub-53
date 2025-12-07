import { ServiceCategory, categoryLabels } from "@/data/vehicleData";
import { Key, Cpu, Gauge, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  'key-programming': <Key className="w-4 h-4" />,
  'ecu-cloning': <Cpu className="w-4 h-4" />,
  'dashboard': <Gauge className="w-4 h-4" />,
  'immo-off': <ShieldOff className="w-4 h-4" />,
};

interface CategoryFilterProps {
  selected: ServiceCategory | 'all';
  onChange: (category: ServiceCategory | 'all') => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories: (ServiceCategory | 'all')[] = ['all', 'key-programming', 'ecu-cloning', 'dashboard', 'immo-off'];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border",
            selected === category
              ? "bg-primary text-primary-foreground border-primary glow-primary"
              : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary"
          )}
        >
          {category !== 'all' && categoryIcons[category]}
          {category === 'all' ? 'All Services' : categoryLabels[category]}
        </button>
      ))}
    </div>
  );
}
