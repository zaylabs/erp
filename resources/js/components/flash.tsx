import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';

export default function Flash() {
  const page = usePage<any>();
  const status: string | undefined = page.props.status as any;
  const normalized: string | undefined = page.props.normalized_notice as any;
  if (!status && !normalized) return null;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-2 px-4 py-2">
      {normalized && (
        <Alert>
          <AlertDescription>{normalized}</AlertDescription>
        </Alert>
      )}
      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

