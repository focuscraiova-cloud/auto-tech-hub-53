import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, DollarSign, Wrench, AlertTriangle, Cpu, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { VariantSelector } from '@/components/procedure/VariantSelector';
import { ToolSelector } from '@/components/procedure/ToolSelector';
import { StepGuide } from '@/components/procedure/StepGuide';
import { LinkedProcedures } from '@/components/procedure/LinkedProcedures';
import { FeedbackSection } from '@/components/procedure/FeedbackSection';
import { difficultyColors } from '@/data/vehicleData';
import type { DifficultyLevel } from '@/data/vehicleData';

interface ProcedureData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  time_minutes: number;
  cost_min: number;
  cost_max: number;
  chip_type: string | null;
  pin_code: string | null;
  tools: any[];
  steps: any[];
  notes: any[];
  model: {
    id: string;
    name: string;
    years: string;
    make: {
      id: string;
      name: string;
    };
  };
}

interface Variant {
  id: string;
  variant_name: string;
  hardware_type: string | null;
  notes: any[];
}

interface ToolGuide {
  id: string;
  tool_name: string;
  steps: any[];
  notes: any[];
}

const categoryLabels: Record<string, string> = {
  'key-programming': 'Key Programming',
  'ecu-cloning': 'ECU Cloning',
  'dashboard': 'Dashboard',
  'immo-off': 'IMMO Off'
};

export default function Procedure() {
  const { procedureId } = useParams();
  const { user } = useAuth();
  
  const [procedure, setProcedure] = useState<ProcedureData | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [toolGuides, setToolGuides] = useState<ToolGuide[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolGuide | null>(null);
  const [linkedProcedures, setLinkedProcedures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (procedureId) {
      fetchProcedure();
    }
  }, [procedureId]);

  useEffect(() => {
    if (selectedVariant) {
      fetchToolGuides(selectedVariant.id);
    } else {
      setToolGuides([]);
      setSelectedTool(null);
    }
  }, [selectedVariant]);

  const fetchProcedure = async () => {
    setIsLoading(true);
    
    const { data: procData, error: procError } = await supabase
      .from('procedures')
      .select(`
        *,
        model:models (
          id,
          name,
          years,
          make:makes (
            id,
            name
          )
        )
      `)
      .eq('id', procedureId)
      .maybeSingle();

    if (procError || !procData) {
      console.error('Error fetching procedure:', procError);
      setIsLoading(false);
      return;
    }

    // Parse JSON fields
    const parsedProcedure: ProcedureData = {
      ...procData,
      tools: Array.isArray(procData.tools) ? procData.tools : [],
      steps: Array.isArray(procData.steps) ? procData.steps : [],
      notes: Array.isArray(procData.notes) ? procData.notes : [],
      model: procData.model
    };

    setProcedure(parsedProcedure);

    // Fetch variants
    const { data: variantsData } = await supabase
      .from('procedure_variants')
      .select('*')
      .eq('procedure_id', procedureId);

    if (variantsData) {
      const parsedVariants = variantsData.map(v => ({
        ...v,
        notes: Array.isArray(v.notes) ? v.notes : []
      }));
      setVariants(parsedVariants);
      if (parsedVariants.length > 0) {
        setSelectedVariant(parsedVariants[0]);
      }
    }

    // Fetch linked procedures
    const { data: linkedData } = await supabase
      .from('linked_procedures')
      .select(`
        relationship,
        linked_procedure_id
      `)
      .eq('procedure_id', procedureId);

    if (linkedData && linkedData.length > 0) {
      // Fetch the actual procedure details for each linked procedure
      const linkedIds = linkedData.map(l => l.linked_procedure_id);
      const { data: linkedProcData } = await supabase
        .from('procedures')
        .select('id, title, category, difficulty')
        .in('id', linkedIds);
      
      if (linkedProcData) {
        const mapped = linkedData.map(l => ({
          relationship: l.relationship,
          linked_procedure: linkedProcData.find(p => p.id === l.linked_procedure_id)
        })).filter(l => l.linked_procedure);
        setLinkedProcedures(mapped);
      }
    }

    setIsLoading(false);
  };

  const fetchToolGuides = async (variantId: string) => {
    const { data } = await supabase
      .from('tool_guides')
      .select('*')
      .eq('variant_id', variantId);

    if (data) {
      const parsedGuides = data.map(g => ({
        ...g,
        steps: Array.isArray(g.steps) ? g.steps : [],
        notes: Array.isArray(g.notes) ? g.notes : []
      }));
      setToolGuides(parsedGuides);
      if (parsedGuides.length > 0) {
        setSelectedTool(parsedGuides[0]);
      }
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Procedure Not Found</h1>
          <p className="text-muted-foreground mb-6">The procedure you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displaySteps = selectedTool?.steps.length ? selectedTool.steps : procedure.steps;
  const displayNotes = [
    ...(selectedVariant?.notes || []),
    ...(selectedTool?.notes || []),
    ...procedure.notes
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procedures
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span>{procedure.model.make.name}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{procedure.model.name}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{procedure.title}</span>
        </div>

        {/* Main Info Card */}
        <Card className="border-border/50 bg-card/80 mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30">
                  {categoryLabels[procedure.category] || procedure.category}
                </Badge>
                <CardTitle className="text-2xl md:text-3xl font-bold font-mono">
                  {procedure.title}
                </CardTitle>
                <p className="text-muted-foreground mt-2">{procedure.description}</p>
              </div>
              <Badge className={`${difficultyColors[procedure.difficulty as DifficultyLevel]} border`}>
                {procedure.difficulty.charAt(0).toUpperCase() + procedure.difficulty.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-mono font-semibold">{formatTime(procedure.time_minutes)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <DollarSign className="h-5 w-5 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="font-mono font-semibold">${procedure.cost_min}-{procedure.cost_max}</p>
                </div>
              </div>
              
              {procedure.chip_type && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Cpu className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Chip</p>
                    <p className="font-mono font-semibold text-sm">{procedure.chip_type}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                <Wrench className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-xs text-muted-foreground">Tools</p>
                  <p className="font-mono font-semibold">{procedure.tools.length}</p>
                </div>
              </div>
            </div>

            {/* Default Tools */}
            {procedure.tools.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Required Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {procedure.tools.map((tool: any, i: number) => (
                    <Badge key={i} variant="secondary" className="font-mono text-xs">
                      <Wrench className="h-3 w-3 mr-1" />
                      {typeof tool === 'string' ? tool : tool.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant & Tool Selection */}
        {variants.length > 0 && (
          <Card className="border-border/50 bg-card/80 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-mono">Select Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <VariantSelector
                variants={variants}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
              
              {toolGuides.length > 0 && (
                <ToolSelector
                  toolGuides={toolGuides}
                  selectedTool={selectedTool}
                  onSelect={setSelectedTool}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Step by Step Guide */}
        <StepGuide steps={displaySteps} />

        {/* Notes */}
        {displayNotes.length > 0 && (
          <Card className="border-border/50 bg-card/80 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {displayNotes.map((note: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-warning mt-1">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Linked Procedures */}
        {linkedProcedures.length > 0 && (
          <LinkedProcedures procedures={linkedProcedures} />
        )}

        {/* Feedback Section */}
        {user && (
          <FeedbackSection procedureId={procedure.id} variantId={selectedVariant?.id} />
        )}
      </main>
    </div>
  );
}
