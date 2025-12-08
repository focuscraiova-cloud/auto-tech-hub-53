import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Car, ChevronRight } from 'lucide-react';
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

interface Make {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Model {
  id: string;
  name: string;
  years: string | null;
  make_id: string;
}

export function MakesModelsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Data
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  
  // Dialogs
  const [makeDialogOpen, setMakeDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<Make | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  
  // Forms
  const [makeForm, setMakeForm] = useState({ name: '', logo_url: '' });
  const [modelForm, setModelForm] = useState({ name: '', years: '' });

  useEffect(() => {
    fetchMakes();
  }, []);

  useEffect(() => {
    if (selectedMakeId) {
      fetchModels(selectedMakeId);
    } else {
      setModels([]);
    }
  }, [selectedMakeId]);

  const fetchMakes = async () => {
    setLoading(true);
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

  // Make CRUD
  const openMakeDialog = (make?: Make) => {
    if (make) {
      setEditingMake(make);
      setMakeForm({ name: make.name, logo_url: make.logo_url || '' });
    } else {
      setEditingMake(null);
      setMakeForm({ name: '', logo_url: '' });
    }
    setMakeDialogOpen(true);
  };

  const saveMake = async () => {
    if (!makeForm.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    const makeData = {
      name: makeForm.name.trim(),
      logo_url: makeForm.logo_url.trim() || null,
    };

    if (editingMake) {
      const { error } = await supabase.from('makes').update(makeData).eq('id', editingMake.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Make updated' });
    } else {
      const { error } = await supabase.from('makes').insert(makeData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Make created' });
    }

    setMakeDialogOpen(false);
    fetchMakes();
  };

  const deleteMake = async (id: string) => {
    const { error } = await supabase.from('makes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Make deleted' });
    if (selectedMakeId === id) {
      setSelectedMakeId(null);
    }
    fetchMakes();
  };

  // Model CRUD
  const openModelDialog = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setModelForm({ name: model.name, years: model.years || '' });
    } else {
      setEditingModel(null);
      setModelForm({ name: '', years: '' });
    }
    setModelDialogOpen(true);
  };

  const saveModel = async () => {
    if (!selectedMakeId || !modelForm.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    const modelData = {
      name: modelForm.name.trim(),
      years: modelForm.years.trim() || null,
      make_id: selectedMakeId,
    };

    if (editingModel) {
      const { error } = await supabase.from('models').update(modelData).eq('id', editingModel.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Model updated' });
    } else {
      const { error } = await supabase.from('models').insert(modelData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Model created' });
    }

    setModelDialogOpen(false);
    fetchModels(selectedMakeId);
  };

  const deleteModel = async (id: string) => {
    const { error } = await supabase.from('models').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Model deleted' });
    fetchModels(selectedMakeId!);
  };

  const selectedMake = makes.find(m => m.id === selectedMakeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Makes List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicle Makes ({makes.length})
          </CardTitle>
          <Button size="sm" onClick={() => openMakeDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Add Make
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {makes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No makes yet. Add your first vehicle make!</p>
          ) : (
            makes.map(make => (
              <div
                key={make.id}
                onClick={() => setSelectedMakeId(make.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMakeId === make.id ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{make.name}</span>
                  {selectedMakeId === make.id && <ChevronRight className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openMakeDialog(make); }}>
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
                        <AlertDialogTitle>Delete {make.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all models and procedures for this make. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMake(make.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Models List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {selectedMake ? `${selectedMake.name} Models (${models.length})` : 'Select a Make'}
          </CardTitle>
          {selectedMakeId && (
            <Button size="sm" onClick={() => openModelDialog()}>
              <Plus className="h-4 w-4 mr-1" /> Add Model
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {!selectedMakeId ? (
            <p className="text-muted-foreground text-center py-8">Select a make to view its models</p>
          ) : models.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No models yet. Add your first model!</p>
          ) : (
            models.map(model => (
              <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <span className="font-medium">{model.name}</span>
                  {model.years && (
                    <Badge variant="outline" className="ml-2 text-xs">{model.years}</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openModelDialog(model)}>
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
                        <AlertDialogTitle>Delete {model.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all procedures for this model. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteModel(model.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Make Dialog */}
      <Dialog open={makeDialogOpen} onOpenChange={setMakeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMake ? 'Edit Make' : 'Add Make'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={makeForm.name}
                onChange={(e) => setMakeForm({ ...makeForm, name: e.target.value })}
                placeholder="e.g. BMW"
              />
            </div>
            <div>
              <Label>Logo URL (optional)</Label>
              <Input
                value={makeForm.logo_url}
                onChange={(e) => setMakeForm({ ...makeForm, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMakeDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveMake}>{editingMake ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Dialog */}
      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                placeholder="e.g. 5 Series (F10)"
              />
            </div>
            <div>
              <Label>Years (optional)</Label>
              <Input
                value={modelForm.years}
                onChange={(e) => setModelForm({ ...modelForm, years: e.target.value })}
                placeholder="e.g. 2010-2017"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModelDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveModel}>{editingModel ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}