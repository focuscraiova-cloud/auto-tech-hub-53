import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ToolGuide {
  id: string;
  variant_id: string;
  tool_name: string;
  steps: string[];
  notes: string[];
}

interface ToolGuidesManagerProps {
  variantId: string;
  variantName: string;
}

export function ToolGuidesManager({ variantId, variantName }: ToolGuidesManagerProps) {
  const { toast } = useToast();
  const [toolGuides, setToolGuides] = useState<ToolGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<ToolGuide | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    tool_name: '',
    steps: '',
    notes: '',
  });

  useEffect(() => {
    fetchToolGuides();
  }, [variantId]);

  const fetchToolGuides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tool_guides')
      .select('*')
      .eq('variant_id', variantId)
      .order('tool_name');
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const mapped = (data || []).map(g => ({
        ...g,
        steps: (g.steps as string[]) || [],
        notes: (g.notes as string[]) || [],
      }));
      setToolGuides(mapped);
    }
    setLoading(false);
  };

  const openDialog = (guide?: ToolGuide) => {
    if (guide) {
      setEditingGuide(guide);
      setForm({
        tool_name: guide.tool_name,
        steps: guide.steps.join('\n'),
        notes: guide.notes.join('\n'),
      });
    } else {
      setEditingGuide(null);
      setForm({
        tool_name: '',
        steps: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const saveGuide = async () => {
    if (!form.tool_name.trim()) {
      toast({ title: 'Error', description: 'Tool name is required', variant: 'destructive' });
      return;
    }

    const steps = form.steps.split('\n').filter(Boolean);
    const notes = form.notes.split('\n').filter(Boolean);

    const guideData = {
      variant_id: variantId,
      tool_name: form.tool_name.trim(),
      steps,
      notes,
    };

    if (editingGuide) {
      const { error } = await supabase
        .from('tool_guides')
        .update(guideData)
        .eq('id', editingGuide.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Tool guide updated' });
    } else {
      const { error } = await supabase
        .from('tool_guides')
        .insert(guideData);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Tool guide created' });
    }

    setDialogOpen(false);
    fetchToolGuides();
  };

  const deleteGuide = async (id: string) => {
    const { error } = await supabase.from('tool_guides').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Tool guide deleted' });
    fetchToolGuides();
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground hover:text-foreground">
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Tool Guides ({toolGuides.length})
            </span>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-2">Loading...</p>
          ) : (
            <>
              {toolGuides.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No tool-specific guides yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {toolGuides.map(guide => (
                    <div
                      key={guide.id}
                      className="flex items-center justify-between p-2 rounded border border-border/50 bg-background/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {guide.tool_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {guide.steps.length} steps
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDialog(guide)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete tool guide?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the {guide.tool_name} guide for {variantName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteGuide(guide.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => openDialog()}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tool Guide
              </Button>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Tool Guide Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGuide ? `Edit ${editingGuide.tool_name} Guide` : 'New Tool Guide'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                for {variantName}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tool Name</Label>
              <Input
                value={form.tool_name}
                onChange={e => setForm({ ...form, tool_name: e.target.value })}
                placeholder="e.g., VVDI Prog, Autel IM608, Lonsdor K518"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the diagnostic tool brand/model name
              </p>
            </div>
            <div>
              <Label>Steps (one per line)</Label>
              <Textarea
                value={form.steps}
                onChange={e => setForm({ ...form, steps: e.target.value })}
                rows={8}
                placeholder="Connect VVDI Prog to cluster via included wiring&#10;Power on and select BMW > F Series > 6WA&#10;Read EEPROM data and save backup&#10;..."
              />
            </div>
            <div>
              <Label>Notes (one per line, optional)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Firmware v4.9.0 or higher required&#10;Use 12V external power supply for stability"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveGuide}>{editingGuide ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
