import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProceduresManager } from './ProceduresManager';
import { FeedbackModeration } from './FeedbackModeration';
import { MakesModelsManager } from './MakesModelsManager';

export function AdminTabs() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="makes-models" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="makes-models">Makes & Models</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Makes & Models from Supabase */}
        <TabsContent value="makes-models" className="space-y-4">
          <MakesModelsManager />
        </TabsContent>

        {/* Procedures from Supabase */}
        <TabsContent value="procedures" className="space-y-4">
          <ProceduresManager />
        </TabsContent>

        {/* Feedback Moderation */}
        <TabsContent value="feedback" className="space-y-4">
          <FeedbackModeration />
        </TabsContent>
      </Tabs>
    </div>
  );
}