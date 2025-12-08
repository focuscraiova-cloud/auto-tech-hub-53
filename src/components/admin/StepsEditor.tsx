import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface StepsEditorProps {
  steps: string[];
  onChange: (steps: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function StepsEditor({ steps, onChange, label = 'Steps', placeholder = 'Enter step...' }: StepsEditorProps) {
  const [newStep, setNewStep] = useState('');

  const addStep = () => {
    if (newStep.trim()) {
      onChange([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    onChange(updated);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    
    const updated = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStep();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {/* Existing steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-xs font-mono text-muted-foreground w-6">{index + 1}.</span>
            <Input
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => removeStep(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new step */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground w-6 ml-12">{steps.length + 1}.</span>
        <Input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={addStep}
          disabled={!newStep.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">Press Enter to add a step</p>
    </div>
  );
}
