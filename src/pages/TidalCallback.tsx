import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeTidalCode } from '@/lib/tidal';
import { Loader2, AlertCircle } from 'lucide-react';

export default function TidalCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const oauthError = params.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      return;
    }

    exchangeTidalCode(code)
      .then(() => {
        navigate('/sources', { replace: true });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3 text-destructive max-w-md text-center">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Tidal connection failed</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/sources', { replace: true })}
            className="mt-2 text-xs text-primary underline"
          >
            Back to Sources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Connecting to Tidal...</p>
      </div>
    </div>
  );
}
