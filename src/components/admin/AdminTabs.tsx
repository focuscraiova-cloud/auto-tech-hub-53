import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Download, Upload, RotateCcw } from 'lucide-react';
import { useVehicleData } from '@/contexts/VehicleDataContext';
import { MakeForm } from './MakeForm';
import { ModelForm } from './ModelForm';
import { ProcedureForm } from './ProcedureForm';
import { VehicleModel, Procedure } from '@/data/vehicleData';
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

export function AdminTabs() {
  const { makes, addMake, updateMake, deleteMake, addModel, updateModel, deleteModel, addProcedure, updateProcedure, deleteProcedure, resetToDefault, exportData, importData } = useVehicleData();
  const { toast } = useToast();
  
  // Makes state
  const [showMakeForm, setShowMakeForm] = useState(false);
  const [editingMake, setEditingMake] = useState<string | null>(null);

  // Models state
  const [selectedMakeForModels, setSelectedMakeForModels] = useState<string>('');
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);

  // Procedures state
  const [selectedMakeForProcs, setSelectedMakeForProcs] = useState<string>('');
  const [selectedModelForProcs, setSelectedModelForProcs] = useState<string>('');
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  const selectedMakeModels = makes.find(m => m.make === selectedMakeForModels)?.models || [];
  const selectedMakeForProcsModels = makes.find(m => m.make === selectedMakeForProcs)?.models || [];
  const selectedModelProcedures = selectedMakeForProcsModels.find(m => m.model === selectedModelForProcs)?.procedures || [];

  // Make handlers
  const handleAddMake = (make: string) => {
    addMake(make);
    setShowMakeForm(false);
    toast({ title: 'Make added', description: `${make} has been added.` });
  };

  const handleUpdateMake = (newMake: string) => {
    if (editingMake) {
      updateMake(editingMake, newMake);
      setEditingMake(null);
      toast({ title: 'Make updated', description: `Updated to ${newMake}.` });
    }
  };

  const handleDeleteMake = (make: string) => {
    deleteMake(make);
    toast({ title: 'Make deleted', description: `${make} has been removed.` });
  };

  // Model handlers
  const handleAddModel = (model: Omit<VehicleModel, 'procedures'>) => {
    if (selectedMakeForModels) {
      addModel(selectedMakeForModels, model);
      setShowModelForm(false);
      toast({ title: 'Model added', description: `${model.model} has been added.` });
    }
  };

  const handleUpdateModel = (model: Omit<VehicleModel, 'procedures'>) => {
    if (selectedMakeForModels && editingModel) {
      updateModel(selectedMakeForModels, editingModel.model, model);
      setEditingModel(null);
      toast({ title: 'Model updated', description: `${model.model} has been updated.` });
    }
  };

  const handleDeleteModel = (modelName: string) => {
    if (selectedMakeForModels) {
      deleteModel(selectedMakeForModels, modelName);
      toast({ title: 'Model deleted', description: `${modelName} has been removed.` });
    }
  };

  // Procedure handlers
  const handleAddProcedure = (procedure: Procedure) => {
    if (selectedMakeForProcs && selectedModelForProcs) {
      addProcedure(selectedMakeForProcs, selectedModelForProcs, procedure);
      setShowProcedureForm(false);
      toast({ title: 'Procedure added', description: `${procedure.title} has been added.` });
    }
  };

  const handleUpdateProcedure = (procedure: Procedure) => {
    if (selectedMakeForProcs && selectedModelForProcs && editingProcedure) {
      updateProcedure(selectedMakeForProcs, selectedModelForProcs, editingProcedure.id, procedure);
      setEditingProcedure(null);
      toast({ title: 'Procedure updated', description: `${procedure.title} has been updated.` });
    }
  };

  const handleDeleteProcedure = (procedureId: string) => {
    if (selectedMakeForProcs && selectedModelForProcs) {
      deleteProcedure(selectedMakeForProcs, selectedModelForProcs, procedureId);
      toast({ title: 'Procedure deleted', description: 'Procedure has been removed.' });
    }
  };

  // Export/Import handlers
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', description: 'Your data has been downloaded.' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (importData(result)) {
            toast({ title: 'Data imported', description: 'Your data has been imported successfully.' });
          } else {
            toast({ title: 'Import failed', description: 'Invalid data format.', variant: 'destructive' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    resetToDefault();
    toast({ title: 'Data reset', description: 'Data has been reset to defaults.' });
  };

  return (
    <div className="space-y-6">
      {/* Data Management Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Data
        </Button>
        <Button variant="outline" onClick={handleImport}>
          <Upload className="h-4 w-4 mr-2" /> Import Data
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset to Default
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all your custom data and restore the original sample data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="makes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="makes">Makes</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
        </TabsList>

        {/* Makes Tab */}
        <TabsContent value="makes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vehicle Makes ({makes.length})</h3>
            <Button onClick={() => setShowMakeForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Make
            </Button>
          </div>

          {showMakeForm && (
            <MakeForm onSubmit={handleAddMake} onCancel={() => setShowMakeForm(false)} />
          )}

          {editingMake && (
            <MakeForm 
              initialValue={editingMake} 
              onSubmit={handleUpdateMake} 
              onCancel={() => setEditingMake(null)} 
              isEditing 
            />
          )}

          <div className="grid gap-2">
            {makes.map((make) => (
              <Card key={make.make} className="bg-card/50">
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium">{make.make}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      ({make.models.length} models)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingMake(make.make)}>
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
                          <AlertDialogTitle>Delete {make.make}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will also delete all models and procedures for this make.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMake(make.make)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-48">
              <Select value={selectedMakeForModels} onValueChange={setSelectedMakeForModels}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a make first" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((make) => (
                    <SelectItem key={make.make} value={make.make}>{make.make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMakeForModels && (
              <Button onClick={() => setShowModelForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Model
              </Button>
            )}
          </div>

          {showModelForm && selectedMakeForModels && (
            <ModelForm onSubmit={handleAddModel} onCancel={() => setShowModelForm(false)} />
          )}

          {editingModel && selectedMakeForModels && (
            <ModelForm 
              initialValue={editingModel} 
              onSubmit={handleUpdateModel} 
              onCancel={() => setEditingModel(null)} 
              isEditing 
            />
          )}

          {selectedMakeForModels ? (
            <div className="grid gap-2">
              {selectedMakeModels.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No models yet. Add your first model!</p>
              ) : (
                selectedMakeModels.map((model) => (
                  <Card key={model.model} className="bg-card/50">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium">{model.model}</span>
                        {model.years && (
                          <span className="text-muted-foreground text-sm ml-2">
                            ({model.years})
                          </span>
                        )}
                        <span className="text-muted-foreground text-sm ml-2">
                          • {model.procedures.length} procedures
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingModel(model)}>
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
                              <AlertDialogTitle>Delete {model.model}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will also delete all procedures for this model.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteModel(model.model)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Select a make to view and manage its models</p>
          )}
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures" className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-40">
              <Select value={selectedMakeForProcs} onValueChange={(v) => { setSelectedMakeForProcs(v); setSelectedModelForProcs(''); }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((make) => (
                    <SelectItem key={make.make} value={make.make}>{make.make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-40">
              <Select value={selectedModelForProcs} onValueChange={setSelectedModelForProcs} disabled={!selectedMakeForProcs}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMakeForProcsModels.map((model) => (
                    <SelectItem key={model.model} value={model.model}>{model.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMakeForProcs && selectedModelForProcs && (
              <Button onClick={() => setShowProcedureForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Procedure
              </Button>
            )}
          </div>

          {showProcedureForm && selectedMakeForProcs && selectedModelForProcs && (
            <ProcedureForm onSubmit={handleAddProcedure} onCancel={() => setShowProcedureForm(false)} />
          )}

          {editingProcedure && selectedMakeForProcs && selectedModelForProcs && (
            <ProcedureForm 
              initialValue={editingProcedure} 
              onSubmit={handleUpdateProcedure} 
              onCancel={() => setEditingProcedure(null)} 
              isEditing 
            />
          )}

          {selectedMakeForProcs && selectedModelForProcs ? (
            <div className="grid gap-2">
              {selectedModelProcedures.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No procedures yet. Add your first procedure!</p>
              ) : (
                selectedModelProcedures.map((procedure) => (
                  <Card key={procedure.id} className="bg-card/50">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium">{procedure.title}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          • {procedure.category} • {procedure.difficulty}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingProcedure(procedure)}>
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
                              <AlertDialogTitle>Delete procedure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProcedure(procedure.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Select a make and model to view and manage procedures</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
