import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { Procedure, ServiceCategory, DifficultyLevel, Tool, categoryLabels } from '@/data/vehicleData';

interface ProcedureFormProps {
  initialValue?: Procedure;
  onSubmit: (procedure: Procedure) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ProcedureForm({ initialValue, onSubmit, onCancel, isEditing = false }: ProcedureFormProps) {
  const [title, setTitle] = useState(initialValue?.title || '');
  const [description, setDescription] = useState(initialValue?.description || '');
  const [category, setCategory] = useState<ServiceCategory>(initialValue?.category || 'key-programming');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialValue?.difficulty || 'medium');
  const [timeMinutes, setTimeMinutes] = useState(initialValue?.timeMinutes?.toString() || '');
  const [costMin, setCostMin] = useState(initialValue?.cost?.min?.toString() || '');
  const [costMax, setCostMax] = useState(initialValue?.cost?.max?.toString() || '');
  const [tools, setTools] = useState<Tool[]>(initialValue?.tools || []);
  const [steps, setSteps] = useState<string[]>(initialValue?.steps || ['']);
  const [notes, setNotes] = useState<string[]>(initialValue?.notes || []);
  const [chipType, setChipType] = useState(initialValue?.chipType || '');
  const [pinCode, setPinCode] = useState(initialValue?.pinCode || '');

  useEffect(() => {
    if (initialValue) {
      setTitle(initialValue.title);
      setDescription(initialValue.description);
      setCategory(initialValue.category);
      setDifficulty(initialValue.difficulty);
      setTimeMinutes(initialValue.timeMinutes?.toString() || '');
      setCostMin(initialValue.cost?.min?.toString() || '');
      setCostMax(initialValue.cost?.max?.toString() || '');
      setTools(initialValue.tools || []);
      setSteps(initialValue.steps || ['']);
      setNotes(initialValue.notes || []);
      setChipType(initialValue.chipType || '');
      setPinCode(initialValue.pinCode || '');
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const procedure: Procedure = {
        id: initialValue?.id || `proc-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        timeMinutes: timeMinutes ? parseInt(timeMinutes) : 0,
        cost: {
          min: costMin ? parseInt(costMin) : 0,
          max: costMax ? parseInt(costMax) : parseInt(costMin) || 0,
        },
        tools: tools.filter(t => t.name.trim()),
        steps: steps.filter(s => s.trim()),
        notes: notes.filter(n => n.trim()).length > 0 ? notes.filter(n => n.trim()) : undefined,
        chipType: chipType.trim() || undefined,
        pinCode: pinCode.trim() || undefined,
      };
      onSubmit(procedure);
    }
  };

  const addTool = () => {
    setTools([...tools, { name: '', required: true }]);
  };

  const updateTool = (index: number, field: keyof Tool, value: string | boolean) => {
    setTools(tools.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    setSteps(steps.map((s, i) => i === index ? value : s));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const addNote = () => {
    setNotes([...notes, '']);
  };

  const updateNote = (index: number, value: string) => {
    setNotes(notes.map((n, i) => i === index ? value : n));
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isEditing ? 'Edit Procedure' : 'Add New Procedure'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Key Programming - All Keys Lost"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the procedure..."
                className="bg-background"
              />
            </div>
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time & Cost */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time (minutes)</Label>
              <Input
                id="time"
                type="number"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(e.target.value)}
                placeholder="e.g., 45"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costMin">Cost Min ($)</Label>
              <Input
                id="costMin"
                type="number"
                value={costMin}
                onChange={(e) => setCostMin(e.target.value)}
                placeholder="e.g., 150"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costMax">Cost Max ($)</Label>
              <Input
                id="costMax"
                type="number"
                value={costMax}
                onChange={(e) => setCostMax(e.target.value)}
                placeholder="e.g., 250"
                className="bg-background"
              />
            </div>
          </div>

          {/* Chip Type & Pin Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chipType">Chip Type</Label>
              <Input
                id="chipType"
                value={chipType}
                onChange={(e) => setChipType(e.target.value)}
                placeholder="e.g., ID46, Megamos AES"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pinCode">Pin Code Info</Label>
              <Input
                id="pinCode"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g., Read from CAS module"
                className="bg-background"
              />
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tools Required</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTool}>
                <Plus className="h-4 w-4 mr-1" /> Add Tool
              </Button>
            </div>
            <div className="space-y-2">
              {tools.map((tool, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={tool.name}
                    onChange={(e) => updateTool(index, 'name', e.target.value)}
                    placeholder="Tool name"
                    className="bg-background flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={tool.required}
                      onCheckedChange={(checked) => updateTool(index, 'required', !!checked)}
                    />
                    <Label htmlFor={`required-${index}`} className="text-sm">Required</Label>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTool(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                  <Input
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="Describe this step..."
                    className="bg-background flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Notes (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addNote}>
                <Plus className="h-4 w-4 mr-1" /> Add Note
              </Button>
            </div>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={note}
                    onChange={(e) => updateNote(index, e.target.value)}
                    placeholder="Additional note..."
                    className="bg-background flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeNote(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button type="submit" disabled={!title.trim()}>
              {isEditing ? 'Update' : 'Add'} Procedure
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
