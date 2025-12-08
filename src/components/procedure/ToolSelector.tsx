import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wrench } from 'lucide-react';

interface ToolGuide {
  id: string;
  tool_name: string;
  steps: any[];
  notes: any[];
}

interface ToolSelectorProps {
  toolGuides: ToolGuide[];
  selectedTool: ToolGuide | null;
  onSelect: (tool: ToolGuide) => void;
}

export function ToolSelector({ toolGuides, selectedTool, onSelect }: ToolSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-warning" />
        Select Your Tool
      </Label>
      <Select
        value={selectedTool?.id || ''}
        onValueChange={(value) => {
          const tool = toolGuides.find(t => t.id === value);
          if (tool) onSelect(tool);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select tool..." />
        </SelectTrigger>
        <SelectContent>
          {toolGuides.map((tool) => (
            <SelectItem key={tool.id} value={tool.id}>
              <span className="font-mono">{tool.tool_name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
