import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProcedureCard } from "@/components/ProcedureCard";
import { SearchBar } from "@/components/SearchBar";
import { StatsCards } from "@/components/StatsCards";
import { ServiceCategory } from "@/data/vehicleData";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DbProcedure {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  time_minutes: number;
  cost_min: number;
  cost_max: number;
  chip_type: string | null;
  tools: any[];
  steps: any[];
  notes: any[];
  model: {
    id: string;
    name: string;
    make: {
      id: string;
      name: string;
    };
  };
}

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [dbProcedures, setDbProcedures] = useState<DbProcedure[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [counts, setCounts] = useState({ makes: 0, models: 0 });

  // Auth redirect disabled - keeping code for later
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     navigate('/auth');
  //   }
  // }, [user, authLoading, navigate]);

  // Fetch data from database
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingDb(true);
    
    // Fetch procedures with steps
    const { data: procData } = await supabase
      .from('procedures')
      .select(`
        id, title, description, category, difficulty, time_minutes,
        cost_min, cost_max, chip_type, tools, steps, notes,
        model:models (
          id, name,
          make:makes (id, name)
        )
      `);
    
    if (procData) {
      setDbProcedures(procData as unknown as DbProcedure[]);
    }

    // Fetch counts
    const { count: makesCount } = await supabase.from('makes').select('*', { count: 'exact', head: true });
    const { count: modelsCount } = await supabase.from('models').select('*', { count: 'exact', head: true });
    
    setCounts({ makes: makesCount || 0, models: modelsCount || 0 });
    setIsLoadingDb(false);
  };

  // Convert DB procedures to display format
  const displayProcedures = useMemo(() => {
    return dbProcedures.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      category: p.category as ServiceCategory,
      difficulty: p.difficulty as any,
      timeMinutes: p.time_minutes || 0,
      cost: { min: p.cost_min || 0, max: p.cost_max || 0 },
      chipType: p.chip_type,
      tools: Array.isArray(p.tools) ? p.tools.map((t: any) => 
        typeof t === 'string' ? { name: t, required: true } : t
      ) : [],
      steps: Array.isArray(p.steps) ? p.steps : [],
      notes: Array.isArray(p.notes) ? p.notes : [],
      makeName: p.model?.make?.name,
      modelName: p.model?.name
    }));
  }, [dbProcedures]);

  // Filter procedures
  const filteredProcedures = useMemo(() => {
    let procedures = displayProcedures;

    if (categoryFilter !== 'all') {
      procedures = procedures.filter(p => p.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      procedures = procedures.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.chipType?.toLowerCase().includes(query) ||
        p.makeName?.toLowerCase().includes(query) ||
        p.modelName?.toLowerCase().includes(query) ||
        p.tools.some((t: any) => t.name?.toLowerCase().includes(query))
      );
    }

    return procedures;
  }, [displayProcedures, categoryFilter, searchQuery]);

  // Show loading state
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header totalMakes={counts.makes} totalModels={counts.models} />
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

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards procedures={displayProcedures} />
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
            All Procedures
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
                procedureId={procedure.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No procedures found</h4>
            <p className="text-muted-foreground">
              {dbProcedures.length === 0 ? 'Add procedures in the Admin panel' : 'Try adjusting your filters or search query'}
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
