import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Check, X, Edit, Loader2, User, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Feedback {
  id: string;
  content: string;
  feedback_type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  procedure: {
    id: string;
    title: string;
  };
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function FeedbackModeration() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('procedure_feedback')
      .select(`
        id,
        content,
        feedback_type,
        status,
        admin_notes,
        created_at,
        procedure:procedures (
          id,
          title
        ),
        profile:profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setFeedbacks(data as unknown as Feedback[]);
    }
    setIsLoading(false);
  };

  const updateFeedbackStatus = async (id: string, status: string, content?: string) => {
    const updateData: Record<string, any> = {
      status,
      reviewed_at: new Date().toISOString()
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('procedure_feedback')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: `Feedback ${status === 'approved' ? 'approved' : 'rejected'}.`
      });
      fetchFeedbacks();
      setEditingFeedback(null);
      setAdminNotes('');
    }
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase
      .from('procedure_feedback')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete feedback.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Feedback has been deleted.'
      });
      fetchFeedbacks();
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

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    approved: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30'
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Badge variant="outline">
          {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Feedbacks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback found with the selected filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`${feedbackTypeColors[feedback.feedback_type]} border`}>
                        {feedbackTypeLabels[feedback.feedback_type]}
                      </Badge>
                      <Badge className={`${statusColors[feedback.status]} border`}>
                        {feedback.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-mono">
                      {feedback.procedure?.title || 'Unknown Procedure'}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {feedback.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:text-success hover:bg-success/10"
                          onClick={() => updateFeedbackStatus(feedback.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-warning hover:text-warning hover:bg-warning/10"
                          onClick={() => {
                            setEditingFeedback(feedback);
                            setEditedContent(feedback.content);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => updateFeedbackStatus(feedback.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteFeedback(feedback.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm mb-3">{feedback.content}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {feedback.profile?.full_name || feedback.profile?.email || 'Anonymous'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(feedback.created_at).toLocaleString()}
                  </span>
                </div>

                {feedback.admin_notes && (
                  <div className="mt-3 p-2 rounded bg-secondary/50 text-xs">
                    <strong>Admin Notes:</strong> {feedback.admin_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingFeedback} onOpenChange={() => setEditingFeedback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit & Approve Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Admin Notes (optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this decision..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFeedback(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingFeedback) {
                  updateFeedbackStatus(editingFeedback.id, 'approved', editedContent);
                }
              }}
            >
              Approve with Edits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
