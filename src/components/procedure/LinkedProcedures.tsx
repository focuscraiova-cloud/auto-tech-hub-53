import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, ChevronRight } from 'lucide-react';
import { difficultyColors } from '@/data/vehicleData';
import type { DifficultyLevel } from '@/data/vehicleData';

const categoryLabels: Record<string, string> = {
  'key-programming': 'Key Programming',
  'ecu-cloning': 'ECU Cloning',
  'dashboard': 'Dashboard',
  'immo-off': 'IMMO Off'
};

interface LinkedProcedure {
  relationship: string;
  linked_procedure: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
}

interface LinkedProceduresProps {
  procedures: LinkedProcedure[];
}

export function LinkedProcedures({ procedures }: LinkedProceduresProps) {
  const relationshipLabels: Record<string, string> = {
    required: 'Required',
    recommended: 'Recommended',
    related: 'Related'
  };

  const relationshipColors: Record<string, string> = {
    required: 'bg-destructive/20 text-destructive border-destructive/30',
    recommended: 'bg-warning/20 text-warning border-warning/30',
    related: 'bg-secondary text-secondary-foreground border-border'
  };

  return (
    <Card className="border-border/50 bg-card/80 mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-mono flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Linked Procedures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {procedures.map((item, index) => (
            <Link
              key={index}
              to={`/procedure/${item.linked_procedure.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30 group">
                <div className="flex items-center gap-3">
                  <Badge className={`${relationshipColors[item.relationship]} border text-xs`}>
                    {relationshipLabels[item.relationship] || item.relationship}
                  </Badge>
                  <div>
                    <p className="font-mono font-semibold group-hover:text-primary transition-colors">
                      {item.linked_procedure.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabels[item.linked_procedure.category] || item.linked_procedure.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${difficultyColors[item.linked_procedure.difficulty as DifficultyLevel]} border text-xs`}>
                    {item.linked_procedure.difficulty}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
