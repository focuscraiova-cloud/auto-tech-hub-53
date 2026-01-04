import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryLabels, difficultyColors, ServiceCategory, DifficultyLevel } from "@/data/vehicleData";
import { Clock, DollarSign, Wrench, ChevronDown, ChevronUp, Cpu, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToolItem {
  name: string;
  required?: boolean;
}

interface StepItem {
  title?: string;
  description?: string;
}

export interface DisplayProcedure {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  timeMinutes: number;
  difficulty: DifficultyLevel;
  cost: { min: number; max: number };
  tools: ToolItem[];
  steps: (string | StepItem)[];
  notes?: (string | { content: string })[];
  chipType?: string | null;
  makeName?: string;
  modelName?: string;
}

interface ProcedureCardProps {
  procedure: DisplayProcedure;
  index: number;
  procedureId?: string;
}

export function ProcedureCard({ procedure, index, procedureId }: ProcedureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleCardClick = () => {
    if (procedureId) {
      navigate(`/procedure/${procedureId}`);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleFullGuide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (procedureId) {
      navigate(`/procedure/${procedureId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "card-glow bg-card border border-border rounded-xl p-5 transition-all duration-300 cursor-pointer",
        "hover:border-primary/40 animate-slide-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Header */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/20 text-primary mb-2">
                {categoryLabels[procedure.category]}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {procedure.title}
              </h3>
            </div>
            <span className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap",
              difficultyColors[procedure.difficulty]
            )}>
              {procedure.difficulty.toUpperCase()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {procedure.description}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-mono">{formatTime(procedure.timeMinutes)}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="font-mono">${procedure.cost.min} - ${procedure.cost.max}</span>
            </div>
            {procedure.chipType && (
              <div className="flex items-center gap-2 text-foreground">
                <Cpu className="w-4 h-4 text-accent" />
                <span className="font-mono">{procedure.chipType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tools Preview */}
        <div className="lg:w-48 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Wrench className="w-4 h-4" />
            <span>Tools Required</span>
          </div>
          <div className="space-y-1">
            {procedure.tools.slice(0, 3).map((tool, i) => (
              <div key={i} className="text-xs font-mono text-foreground flex items-center gap-1">
                <span className={tool.required ? "text-primary" : "text-muted-foreground"}>
                  {tool.required ? "req" : "opt"}
                </span>
                {tool.name}
              </div>
            ))}
            {procedure.tools.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{procedure.tools.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleQuickView}
          className="gap-2 text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Quick View
            </>
          )}
        </Button>
        
        {procedureId && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleFullGuide}
          >
            <ExternalLink className="w-3 h-3" />
            Full Guide
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
          {/* Steps */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Procedure Steps
            </h4>
            <ol className="space-y-2 ml-4">
              {procedure.steps.map((step, i) => {
                const stepText = typeof step === 'string' ? step : (step.title || step.description || '');
                return (
                  <li key={i} className="text-sm text-muted-foreground flex gap-3">
                    <span className="font-mono text-primary shrink-0">{i + 1}.</span>
                    {stepText}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* All Tools */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-accent" />
              Complete Tool List
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {procedure.tools.map((tool, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-mono",
                    tool.required
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {tool.name}
                  {!tool.required && <span className="ml-1 opacity-60">(opt)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {procedure.notes && procedure.notes.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Important Notes
              </h4>
              <ul className="space-y-1">
                {procedure.notes.map((note, i) => {
                  const noteText = typeof note === 'string' ? note : (note.content || '');
                  return (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-warning">-</span>
                      {noteText}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
