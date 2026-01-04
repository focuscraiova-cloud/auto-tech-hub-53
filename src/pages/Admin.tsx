import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { useAuth } from '@/contexts/AuthContext';

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Auth redirect disabled - keeping code for later
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     navigate('/auth');
  //   }
  // }, [user, isLoading, navigate]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return null;
  // }

  // if (!isAdmin) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
  //         <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
  //         <Link to="/">
  //           <Button>Go Home</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-mono">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AdminTabs />
      </main>
    </div>
  );
}
