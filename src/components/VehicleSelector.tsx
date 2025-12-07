import { useState, useMemo } from "react";
import { VehicleMake, VehicleModel } from "@/data/vehicleData";
import { useVehicleData } from "@/contexts/VehicleDataContext";
import { Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleSelectorProps {
  onSelect: (make: VehicleMake | null, model: VehicleModel | null) => void;
}

export function VehicleSelector({ onSelect }: VehicleSelectorProps) {
  const { makes } = useVehicleData();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const currentMake = useMemo(() => 
    makes.find(v => v.make === selectedMake) || null,
    [selectedMake, makes]
  );

  const currentModel = useMemo(() =>
    currentMake?.models.find(m => m.model === selectedModel) || null,
    [currentMake, selectedModel]
  );

  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel("");
    const make = makes.find(v => v.make === value) || null;
    onSelect(make, null);
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    const model = currentMake?.models.find(m => m.model === value) || null;
    onSelect(currentMake, model);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Make
        </label>
        <Select value={selectedMake} onValueChange={handleMakeChange}>
          <SelectTrigger className="w-full bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              <SelectValue placeholder="Select manufacturer" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {makes.map((vehicle) => (
              <SelectItem 
                key={vehicle.make} 
                value={vehicle.make}
                className="hover:bg-secondary focus:bg-secondary"
              >
                {vehicle.make}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Model
        </label>
        <Select 
          value={selectedModel} 
          onValueChange={handleModelChange}
          disabled={!selectedMake}
        >
          <SelectTrigger className="w-full bg-card border-border hover:border-primary/50 transition-colors disabled:opacity-50">
            <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {currentMake?.models.map((model) => (
              <SelectItem 
                key={model.model} 
                value={model.model}
                className="hover:bg-secondary focus:bg-secondary"
              >
                {model.model} ({model.years})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
