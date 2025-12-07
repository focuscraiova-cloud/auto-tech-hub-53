import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleModel } from '@/data/vehicleData';

interface ModelFormProps {
  initialValue?: Omit<VehicleModel, 'procedures'>;
  onSubmit: (model: Omit<VehicleModel, 'procedures'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ModelForm({ initialValue, onSubmit, onCancel, isEditing = false }: ModelFormProps) {
  const [model, setModel] = useState(initialValue?.model || '');
  const [years, setYears] = useState(initialValue?.years || '');

  useEffect(() => {
    if (initialValue) {
      setModel(initialValue.model);
      setYears(initialValue.years || '');
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (model.trim()) {
      onSubmit({
        model: model.trim(),
        years: years.trim(),
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isEditing ? 'Edit Model' : 'Add New Model'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., 3 Series (E90), E-Class (W212)"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years</Label>
            <Input
              id="years"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g., 2018-2024"
              className="bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!model.trim()}>
              {isEditing ? 'Update' : 'Add'} Model
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
