import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border border-border shadow-lg">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Account Not Registered
          </h1>
          <p className="text-muted-foreground mb-6">
            Your account is not registered in our system. Please contact the 
            administrator to get access to the Trace application.
          </p>
          <Link 
            to="/" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
