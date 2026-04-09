import { useEffect } from 'react';
import { exchangeTidalCode } from '@/lib/tidal';
import { Loader2 } from 'lucide-react';

export default function TidalCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      window.opener?.postMessage({ type: 'tidal_oauth_error', error }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      exchangeTidalCode(code)
        .then((token) => {
          window.opener?.postMessage({ type: 'tidal_oauth_success', token }, window.location.origin);
          window.close();
        })
        .catch((err) => {
          window.opener?.postMessage({ type: 'tidal_oauth_error', error: err.message }, window.location.origin);
          window.close();
        });
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Connecting to Tidal...</p>
      </div>
    </div>
  );
}
