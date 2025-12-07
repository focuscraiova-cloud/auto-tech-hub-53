import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VehicleMake, VehicleModel, Procedure, vehicleDatabase } from '@/data/vehicleData';

interface VehicleDataContextType {
  makes: VehicleMake[];
  addMake: (make: string) => void;
  updateMake: (oldMake: string, newMake: string) => void;
  deleteMake: (make: string) => void;
  addModel: (makeName: string, model: Omit<VehicleModel, 'procedures'>) => void;
  updateModel: (makeName: string, oldModelName: string, newModel: Omit<VehicleModel, 'procedures'>) => void;
  deleteModel: (makeName: string, modelName: string) => void;
  addProcedure: (makeName: string, modelName: string, procedure: Procedure) => void;
  updateProcedure: (makeName: string, modelName: string, procedureId: string, procedure: Procedure) => void;
  deleteProcedure: (makeName: string, modelName: string, procedureId: string) => void;
  resetToDefault: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
}

const VehicleDataContext = createContext<VehicleDataContextType | undefined>(undefined);

export function VehicleDataProvider({ children }: { children: ReactNode }) {
  const [makes, setMakes] = useLocalStorage<VehicleMake[]>('vehicleData', vehicleDatabase);

  const addMake = (make: string) => {
    setMakes(prev => [...prev, { make, models: [] }]);
  };

  const updateMake = (oldMake: string, newMake: string) => {
    setMakes(prev => prev.map(m => 
      m.make === oldMake ? { ...m, make: newMake } : m
    ));
  };

  const deleteMake = (make: string) => {
    setMakes(prev => prev.filter(m => m.make !== make));
  };

  const addModel = (makeName: string, model: Omit<VehicleModel, 'procedures'>) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { ...m, models: [...m.models, { ...model, procedures: [] }] }
        : m
    ));
  };

  const updateModel = (makeName: string, oldModelName: string, newModel: Omit<VehicleModel, 'procedures'>) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { 
            ...m, 
            models: m.models.map(model => 
              model.model === oldModelName 
                ? { ...model, ...newModel }
                : model
            )
          }
        : m
    ));
  };

  const deleteModel = (makeName: string, modelName: string) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { ...m, models: m.models.filter(model => model.model !== modelName) }
        : m
    ));
  };

  const addProcedure = (makeName: string, modelName: string, procedure: Procedure) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { 
            ...m, 
            models: m.models.map(model => 
              model.model === modelName 
                ? { ...model, procedures: [...model.procedures, procedure] }
                : model
            )
          }
        : m
    ));
  };

  const updateProcedure = (makeName: string, modelName: string, procedureId: string, procedure: Procedure) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { 
            ...m, 
            models: m.models.map(model => 
              model.model === modelName 
                ? { 
                    ...model, 
                    procedures: model.procedures.map(p => 
                      p.id === procedureId ? procedure : p
                    )
                  }
                : model
            )
          }
        : m
    ));
  };

  const deleteProcedure = (makeName: string, modelName: string, procedureId: string) => {
    setMakes(prev => prev.map(m => 
      m.make === makeName 
        ? { 
            ...m, 
            models: m.models.map(model => 
              model.model === modelName 
                ? { ...model, procedures: model.procedures.filter(p => p.id !== procedureId) }
                : model
            )
          }
        : m
    ));
  };

  const resetToDefault = () => {
    setMakes(vehicleDatabase);
  };

  const exportData = () => {
    return JSON.stringify(makes, null, 2);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        setMakes(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <VehicleDataContext.Provider value={{
      makes,
      addMake,
      updateMake,
      deleteMake,
      addModel,
      updateModel,
      deleteModel,
      addProcedure,
      updateProcedure,
      deleteProcedure,
      resetToDefault,
      exportData,
      importData,
    }}>
      {children}
    </VehicleDataContext.Provider>
  );
}

export function useVehicleData() {
  const context = useContext(VehicleDataContext);
  if (context === undefined) {
    throw new Error('useVehicleData must be used within a VehicleDataProvider');
  }
  return context;
}
