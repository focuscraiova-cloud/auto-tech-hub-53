import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2, CheckCircle, User } from 'lucide-react';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string()
    .trim()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must be less than 2000 characters'),
  feedbackType: z.enum(['tip', 'correction', 'question'])
});

interface Feedback {
  id: string;
  content: string;
  feedback_type: string;
  status: string;
  created_at: string;
}

interface FeedbackSectionProps {
  procedureId: string;
  variantId?: string;
}

export function FeedbackSection({ procedureId, variantId }: FeedbackSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [content, setContent] = useState('');
  const [feedbackType, setFeedbackType] = useState<string>('tip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [procedureId]);

  const fetchFeedbacks = async () => {
    // Don't join profiles to avoid exposing user data
    const { data } = await supabase
      .from('procedure_feedback')
      .select(`
        id,
        content,
        feedback_type,
        status,
        created_at
      `)
      .eq('procedure_id', procedureId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (data) {
      setFeedbacks(data as unknown as Feedback[]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate input
    const validation = feedbackSchema.safeParse({ content, feedbackType });
    if (!validation.success) {
      setValidationError(validation.error.errors[0].message);
      return;
    }
    setValidationError(null);

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('procedure_feedback')
      .insert({
        procedure_id: procedureId,
        variant_id: variantId || null,
        user_id: user.id,
        content: validation.data.content,
        feedback_type: validation.data.feedbackType,
        status: 'pending'
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Feedback submitted',
        description: 'Your feedback has been submitted for review.'
      });
      setContent('');
    }
  };

  const feedbackTypeLabels: Record<string, string> = {
    tip: 'Tip',
    correction: 'Correction',
    question: 'Question'
  };

  const feedbackTypeColors: Record<string, string> = {
    tip: 'bg-success/20 text-success border-success/30',
    correction: 'bg-warning/20 text-warning border-warning/30',
    question: 'bg-primary/20 text-primary border-primary/30'
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg font-mono flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Community Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit Feedback Form */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-4">
          <div className="flex items-center gap-4">
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tip">💡 Tip</SelectItem>
                <SelectItem value="correction">✏️ Correction</SelectItem>
                <SelectItem value="question">❓ Question</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Share your experience</span>
          </div>
          
          <Textarea
            placeholder="Share a tip, suggest a correction, or ask a question... (10-2000 characters)"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setValidationError(null);
            }}
            rows={3}
            maxLength={2000}
          />
          
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/2000 characters
            </span>
            <Button 
              onClick={handleSubmit} 
              disabled={content.trim().length < 10 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Approved Feedbacks */}
        {feedbacks.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Approved Tips & Notes
            </h4>
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${feedbackTypeColors[feedback.feedback_type]} border text-xs`}>
                      {feedbackTypeLabels[feedback.feedback_type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Community Member
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{feedback.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
