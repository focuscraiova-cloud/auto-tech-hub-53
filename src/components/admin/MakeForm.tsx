import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MakeFormProps {
  initialValue?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function MakeForm({ initialValue = '', onSubmit, onCancel, isEditing = false }: MakeFormProps) {
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    setName(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isEditing ? 'Edit Make' : 'Add New Make'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="makeName">Manufacturer Name</Label>
            <Input
              id="makeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., BMW, Mercedes-Benz, Audi"
              className="bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? 'Update' : 'Add'} Make
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
