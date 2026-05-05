import { Globe, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

const Navbar = ({ selectedWebhook, onBack, onNewWebhook }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="rounded-lg bg-blue-600 p-1.5 shrink-0 hidden sm:block">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold leading-none text-zinc-100 truncate">Webhook Tester</span>
            {selectedWebhook && (
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1 truncate">
                /{selectedWebhook.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedWebhook ? (
            <Button variant="outline" size="sm" onClick={onBack} className="gap-2 h-9">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          ) : (
            <Button onClick={onNewWebhook} size="sm" className="gap-2 h-9">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Webhook</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };
