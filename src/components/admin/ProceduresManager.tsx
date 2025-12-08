import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Link as LinkIcon, Cpu, Loader2 } from 'lucide-react';
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
import { difficultyColors } from '@/data/vehicleData';
import type { DifficultyLevel } from '@/data/vehicleData';

interface Make {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  years: string | null;
  make_id: string;
}

interface Procedure {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  time_minutes: number | null;
  cost_min: number | null;
  cost_max: number | null;
  chip_type: string | null;
  pin_code: string | null;
  tools: { name: string; required: boolean }[];
  steps: string[];
  notes: string[];
  model_id: string;
}

interface Variant {
  id: string;
  variant_name: string;
  hardware_type: string | null;
  procedure_id: string;
  notes: string[];
}

interface LinkedProcedure {
  id: string;
  procedure_id: string;
  linked_procedure_id: string;
  relationship: string;
  linked_procedure?: {
    id: string;
    title: string;
    category: string;
  };
}

const categoryOptions = [
  { value: 'key-programming', label: 'Key Programming' },
  { value: 'ecu-cloning', label: 'ECU Cloning' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'immo-off', label: 'IMMO Off' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

export function ProceduresManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Data
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [linkedProcedures, setLinkedProcedures] = useState<LinkedProcedure[]>([]);
  
  // Selection state
  const [selectedMakeId, setSelectedMakeId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('');
  
  // Dialogs
  const [procedureDialogOpen, setProcedureDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [linkedDialogOpen, setLinkedDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  
  // Form state
  const [procedureForm, setProcedureForm] = useState({
    title: '',
    description: '',
    category: 'key-programming',
    difficulty: 'medium',
    time_minutes: '',
    cost_min: '',
    cost_max: '',
    chip_type: '',
    pin_code: '',
    tools: '',
    steps: '',
    notes: '',
  });
  
  const [variantForm, setVariantForm] = useState({
    variant_name: '',
    hardware_type: '',
    notes: '',
  });
  
  const [linkedForm, setLinkedForm] = useState({
    linked_procedure_id: '',
    relationship: 'related',
  });

  // Fetch makes on mount
  useEffect(() => {
    fetchMakes();
    fetchAllProcedures();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMakeId) {
      fetchModels(selectedMakeId);
      setSelectedModelId('');
      setSelectedProcedureId('');
    }
  }, [selectedMakeId]);

  // Fetch procedures when model changes
  useEffect(() => {
    if (selectedModelId) {
      fetchProcedures(selectedModelId);
      setSelectedProcedureId('');
    }
  }, [selectedModelId]);

  // Fetch variants and linked when procedure changes
  useEffect(() => {
    if (selectedProcedureId) {
      fetchVariants(selectedProcedureId);
      fetchLinkedProcedures(selectedProcedureId);
    }
  }, [selectedProcedureId]);

  const fetchMakes = async () => {
    const { data, error } = await supabase.from('makes').select('*').order('name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setMakes(data || []);
    }
    setLoading(false);
  };

  const fetchModels = async (makeId: string) => {
    const { data, error } = await supabase.from('models').select('*').eq('make_id', makeId).order('name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setModels(data || []);
    }
  };

  const fetchProcedures = async (modelId: string) => {
    const { data, error } = await supabase.from('procedures').select('*').eq('model_id', modelId).order('title');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const mapped = (data || []).map(p => ({
        ...p,
        tools: (p.tools as { name: string; required: boolean }[]) || [],
        steps: (p.steps as string[]) || [],
        notes: (p.notes as string[]) || [],
      }));
      setProcedures(mapped);
    }
  };

  const fetchAllProcedures = async () => {
    const { data, error } = await supabase.from('procedures').select('id, title, category').order('title');
    if (error) {
      console.error('Error fetching all procedures:', error);
    } else {
      setAllProcedures((data || []).map(p => ({
        ...p,
        description: null,
        difficulty: '',
        time_minutes: null,
        cost_min: null,
        cost_max: null,
        chip_type: null,
        pin_code: null,
        tools: [],
        steps: [],
        notes: [],
        model_id: '',
      })));
    }
  };

  const fetchVariants = async (procedureId: string) => {
    const { data, error } = await supabase.from('procedure_variants').select('*').eq('procedure_id', procedureId).order('variant_name');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const mapped = (data || []).map(v => ({
        ...v,
        notes: (v.notes as string[]) || [],
      }));
      setVariants(mapped);
    }
  };

  const fetchLinkedProcedures = async (procedureId: string) => {
    const { data, error } = await supabase
      .from('linked_procedures')
      .select('*, linked_procedure:procedures!linked_procedure_id(id, title, category)')
      .eq('procedure_id', procedureId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const mapped = (data || []).map(lp => ({
        ...lp,
        linked_procedure: lp.linked_procedure as { id: string; title: string; category: string } | undefined,
      }));
      setLinkedProcedures(mapped);
    }
  };

  // Procedure CRUD
  const openProcedureDialog = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setProcedureForm({
        title: procedure.title,
        description: procedure.description || '',
        category: procedure.category,
        difficulty: procedure.difficulty,
        time_minutes: procedure.time_minutes?.toString() || '',
        cost_min: procedure.cost_min?.toString() || '',
        cost_max: procedure.cost_max?.toString() || '',
        chip_type: procedure.chip_type || '',
        pin_code: procedure.pin_code || '',
        tools: procedure.tools.map(t => `${t.name}${t.required ? '' : ' (optional)'}`).join('\n'),
        steps: procedure.steps.join('\n'),
        notes: procedure.notes.join('\n'),
      });
    } else {
      setEditingProcedure(null);
      setProcedureForm({
        title: '',
        description: '',
        category: 'key-programming',
        difficulty: 'medium',
        time_minutes: '',
        cost_min: '',
        cost_max: '',
        chip_type: '',
        pin_code: '',
        tools: '',
        steps: '',
        notes: '',
      });
    }
    setProcedureDialogOpen(true);
  };

  const saveProcedure = async () => {
    const tools = procedureForm.tools.split('\n').filter(Boolean).map(t => {
      const isOptional = t.includes('(optional)');
      return { name: t.replace(' (optional)', '').trim(), required: !isOptional };
    });
    const steps = procedureForm.steps.split('\n').filter(Boolean);
    const notes = procedureForm.notes.split('\n').filter(Boolean);

    const procedureData = {
      title: procedureForm.title,
      description: procedureForm.description || null,
      category: procedureForm.category,
      difficulty: procedureForm.difficulty,
      time_minutes: procedureForm.time_minutes ? parseInt(procedureForm.time_minutes) : null,
      cost_min: procedureForm.cost_min ? parseFloat(procedureForm.cost_min) : null,
      cost_max: procedureForm.cost_max ? parseFloat(procedureForm.cost_max) : null,
      chip_type: procedureForm.chip_type || null,
      pin_code: procedureForm.pin_code || null,
      tools,
      steps,
      notes,
      model_id: selectedModelId,
    };

    if (editingProcedure) {
      const { error } = await supabase.from('procedures').update(procedureData).eq('id', editingProcedure.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Procedure updated' });
    } else {
      const { error } = await supabase.from('procedures').insert(procedureData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Procedure created' });
    }

    setProcedureDialogOpen(false);
    fetchProcedures(selectedModelId);
    fetchAllProcedures();
  };

  const deleteProcedure = async (id: string) => {
    const { error } = await supabase.from('procedures').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Procedure deleted' });
    setSelectedProcedureId('');
    fetchProcedures(selectedModelId);
    fetchAllProcedures();
  };

  // Variant CRUD
  const openVariantDialog = (variant?: Variant) => {
    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        variant_name: variant.variant_name,
        hardware_type: variant.hardware_type || '',
        notes: variant.notes.join('\n'),
      });
    } else {
      setEditingVariant(null);
      setVariantForm({
        variant_name: '',
        hardware_type: '',
        notes: '',
      });
    }
    setVariantDialogOpen(true);
  };

  const saveVariant = async () => {
    const notes = variantForm.notes.split('\n').filter(Boolean);

    const variantData = {
      variant_name: variantForm.variant_name,
      hardware_type: variantForm.hardware_type || null,
      notes,
      procedure_id: selectedProcedureId,
    };

    if (editingVariant) {
      const { error } = await supabase.from('procedure_variants').update(variantData).eq('id', editingVariant.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Variant updated' });
    } else {
      const { error } = await supabase.from('procedure_variants').insert(variantData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Variant created' });
    }

    setVariantDialogOpen(false);
    fetchVariants(selectedProcedureId);
  };

  const deleteVariant = async (id: string) => {
    const { error } = await supabase.from('procedure_variants').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Variant deleted' });
    fetchVariants(selectedProcedureId);
  };

  // Linked Procedures CRUD
  const openLinkedDialog = () => {
    setLinkedForm({ linked_procedure_id: '', relationship: 'related' });
    setLinkedDialogOpen(true);
  };

  const saveLinkedProcedure = async () => {
    if (!linkedForm.linked_procedure_id) {
      toast({ title: 'Error', description: 'Please select a procedure', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('linked_procedures').insert({
      procedure_id: selectedProcedureId,
      linked_procedure_id: linkedForm.linked_procedure_id,
      relationship: linkedForm.relationship,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Linked procedure added' });
    setLinkedDialogOpen(false);
    fetchLinkedProcedures(selectedProcedureId);
  };

  const deleteLinkedProcedure = async (id: string) => {
    const { error } = await supabase.from('linked_procedures').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Link removed' });
    fetchLinkedProcedures(selectedProcedureId);
  };

  const selectedProcedure = procedures.find(p => p.id === selectedProcedureId);
  const availableProceduresToLink = allProcedures.filter(
    p => p.id !== selectedProcedureId && !linkedProcedures.some(lp => lp.linked_procedure_id === p.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Vehicle & Procedure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Make</Label>
              <Select value={selectedMakeId} onValueChange={setSelectedMakeId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={!selectedMakeId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} {m.years && `(${m.years})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Procedure</Label>
              <Select value={selectedProcedureId} onValueChange={setSelectedProcedureId} disabled={!selectedModelId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedures List */}
      {selectedModelId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Procedures ({procedures.length})</CardTitle>
            <Button onClick={() => openProcedureDialog()}>
              <Plus className="h-4 w-4 mr-2" /> Add Procedure
            </Button>
          </CardHeader>
          <CardContent>
            {procedures.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No procedures yet.</p>
            ) : (
              <div className="space-y-2">
                {procedures.map(proc => (
                  <div
                    key={proc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedProcedureId === proc.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/30'
                    }`}
                    onClick={() => setSelectedProcedureId(proc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{proc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{proc.category}</Badge>
                          <Badge className={`${difficultyColors[proc.difficulty as DifficultyLevel]} text-xs`}>
                            {proc.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openProcedureDialog(proc); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete procedure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete all variants and linked procedures.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProcedure(proc.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Variants & Linked Procedures */}
      {selectedProcedure && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardware Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Hardware Variants ({variants.length})
              </CardTitle>
              <Button size="sm" onClick={() => openVariantDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No variants. Add hardware-specific variations (e.g., different clusters, ECU types).
                </p>
              ) : (
                <div className="space-y-2">
                  {variants.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                      <div>
                        <p className="font-medium">{v.variant_name}</p>
                        {v.hardware_type && (
                          <Badge variant="outline" className="text-xs mt-1">{v.hardware_type}</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openVariantDialog(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete variant?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will also delete all tool guides for this variant.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteVariant(v.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Procedures */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Linked Procedures ({linkedProcedures.length})
              </CardTitle>
              <Button size="sm" onClick={openLinkedDialog} disabled={availableProceduresToLink.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> Link Procedure
              </Button>
            </CardHeader>
            <CardContent>
              {linkedProcedures.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No linked procedures. Link related/required procedures.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedProcedures.map(lp => (
                    <div key={lp.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                      <div>
                        <p className="font-medium">{lp.linked_procedure?.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{lp.linked_procedure?.category}</Badge>
                          <Badge variant={lp.relationship === 'required' ? 'destructive' : 'secondary'} className="text-xs">
                            {lp.relationship}
                          </Badge>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove link?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLinkedProcedure(lp.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Procedure Dialog */}
      <Dialog open={procedureDialogOpen} onOpenChange={setProcedureDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProcedure ? 'Edit Procedure' : 'New Procedure'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title</Label>
                <Input value={procedureForm.title} onChange={e => setProcedureForm({ ...procedureForm, title: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={procedureForm.description} onChange={e => setProcedureForm({ ...procedureForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={procedureForm.category} onValueChange={v => setProcedureForm({ ...procedureForm, category: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={procedureForm.difficulty} onValueChange={v => setProcedureForm({ ...procedureForm, difficulty: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time (minutes)</Label>
                <Input type="number" value={procedureForm.time_minutes} onChange={e => setProcedureForm({ ...procedureForm, time_minutes: e.target.value })} />
              </div>
              <div>
                <Label>Cost Range</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" value={procedureForm.cost_min} onChange={e => setProcedureForm({ ...procedureForm, cost_min: e.target.value })} />
                  <Input type="number" placeholder="Max" value={procedureForm.cost_max} onChange={e => setProcedureForm({ ...procedureForm, cost_max: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Chip Type</Label>
                <Input value={procedureForm.chip_type} onChange={e => setProcedureForm({ ...procedureForm, chip_type: e.target.value })} placeholder="e.g., D80/P05" />
              </div>
              <div>
                <Label>PIN Code</Label>
                <Input value={procedureForm.pin_code} onChange={e => setProcedureForm({ ...procedureForm, pin_code: e.target.value })} placeholder="e.g., ISN from CAS" />
              </div>
              <div className="col-span-2">
                <Label>Tools (one per line, add "(optional)" for non-required)</Label>
                <Textarea value={procedureForm.tools} onChange={e => setProcedureForm({ ...procedureForm, tools: e.target.value })} rows={3} placeholder="VVDI Prog&#10;Xhorse Key Tool (optional)" />
              </div>
              <div className="col-span-2">
                <Label>Steps (one per line)</Label>
                <Textarea value={procedureForm.steps} onChange={e => setProcedureForm({ ...procedureForm, steps: e.target.value })} rows={5} />
              </div>
              <div className="col-span-2">
                <Label>Notes (one per line)</Label>
                <Textarea value={procedureForm.notes} onChange={e => setProcedureForm({ ...procedureForm, notes: e.target.value })} rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcedureDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProcedure}>{editingProcedure ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariant ? 'Edit Variant' : 'New Hardware Variant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Variant Name</Label>
              <Input value={variantForm.variant_name} onChange={e => setVariantForm({ ...variantForm, variant_name: e.target.value })} placeholder="e.g., CAS4 FEM, 6WA Cluster" />
            </div>
            <div>
              <Label>Hardware Type</Label>
              <Input value={variantForm.hardware_type} onChange={e => setVariantForm({ ...variantForm, hardware_type: e.target.value })} placeholder="e.g., EEPROM, Flash, OBD" />
            </div>
            <div>
              <Label>Notes (one per line)</Label>
              <Textarea value={variantForm.notes} onChange={e => setVariantForm({ ...variantForm, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveVariant}>{editingVariant ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked Procedure Dialog */}
      <Dialog open={linkedDialogOpen} onOpenChange={setLinkedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Procedure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Procedure</Label>
              <Select value={linkedForm.linked_procedure_id} onValueChange={v => setLinkedForm({ ...linkedForm, linked_procedure_id: v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select procedure to link" /></SelectTrigger>
                <SelectContent>
                  {availableProceduresToLink.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Relationship</Label>
              <Select value={linkedForm.relationship} onValueChange={v => setLinkedForm({ ...linkedForm, relationship: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="related">Related</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkedDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveLinkedProcedure}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
