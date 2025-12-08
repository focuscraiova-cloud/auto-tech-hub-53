import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Cpu } from 'lucide-react';

interface Variant {
  id: string;
  variant_name: string;
  hardware_type: string | null;
  notes: any[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-primary" />
        Hardware Variant / EEPROM Type
      </Label>
      <Select
        value={selectedVariant?.id || ''}
        onValueChange={(value) => {
          const variant = variants.find(v => v.id === value);
          if (variant) onSelect(variant);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select hardware variant..." />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id}>
              <div className="flex items-center gap-2">
                <span className="font-mono">{variant.variant_name}</span>
                {variant.hardware_type && (
                  <span className="text-xs text-muted-foreground">({variant.hardware_type})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
