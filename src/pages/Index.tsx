import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { VehicleSelector } from "@/components/VehicleSelector";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProcedureCard } from "@/components/ProcedureCard";
import { SearchBar } from "@/components/SearchBar";
import { StatsCards } from "@/components/StatsCards";
import { VehicleMake, VehicleModel, ServiceCategory, vehicleDatabase } from "@/data/vehicleData";
import { Database, Search, Filter } from "lucide-react";

const Index = () => {
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const handleVehicleSelect = (make: VehicleMake | null, model: VehicleModel | null) => {
    setSelectedMake(make);
    setSelectedModel(model);
  };

  // Get all procedures from the database
  const allProcedures = useMemo(() => {
    if (selectedModel) {
      return selectedModel.procedures;
    }
    if (selectedMake) {
      return selectedMake.models.flatMap(m => m.procedures);
    }
    return vehicleDatabase.flatMap(make => 
      make.models.flatMap(model => model.procedures)
    );
  }, [selectedMake, selectedModel]);

  // Filter procedures
  const filteredProcedures = useMemo(() => {
    let procedures = allProcedures;

    if (categoryFilter !== 'all') {
      procedures = procedures.filter(p => p.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      procedures = procedures.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.chipType?.toLowerCase().includes(query) ||
        p.tools.some(t => t.name.toLowerCase().includes(query))
      );
    }

    return procedures;
  }, [allProcedures, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Automotive Service <span className="text-gradient">Database</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete procedures for key programming, ECU cloning, dashboard repairs, and immobilizer services. 
            Select your vehicle to get started.
          </p>
        </div>

        {/* Vehicle Selector */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Select Vehicle</h3>
          </div>
          <VehicleSelector onSelect={handleVehicleSelect} />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards procedures={allProcedures} />
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {selectedModel ? `${selectedMake?.make} ${selectedModel.model}` : 
             selectedMake ? `All ${selectedMake.make} Models` : 
             'All Vehicles'}
          </h3>
          <span className="text-sm text-muted-foreground font-mono">
            {filteredProcedures.length} procedure{filteredProcedures.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Procedures Grid */}
        {filteredProcedures.length > 0 ? (
          <div className="space-y-4">
            {filteredProcedures.map((procedure, index) => (
              <ProcedureCard 
                key={procedure.id} 
                procedure={procedure} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No procedures found</h4>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            AutoTech Pro Database • Built for automotive technicians
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
