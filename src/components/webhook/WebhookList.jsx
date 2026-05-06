import { motion, AnimatePresence } from 'framer-motion';
import { WebhookCard } from './WebhookCard';
import { Skeleton } from '../ui/Skeleton';

const WebhookCardSkeleton = () => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-xl h-full flex flex-col overflow-hidden min-h-[160px]">
    <div className="flex flex-row items-start justify-between p-6 pb-2 shrink-0">
      <div className="flex-1 space-y-2 pr-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    <div className="flex-1" />
    <div className="p-6 pt-4 shrink-0">
      <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-4">
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

const WebhookList = ({ webhooks, loading, onSelect, onDelete, onCopy }) => {
  if (loading && webhooks.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <WebhookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {webhooks.map((webhook) => (
          <WebhookCard key={webhook.id} webhook={webhook} onSelect={onSelect} onDelete={onDelete} onCopy={onCopy} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { WebhookList };
