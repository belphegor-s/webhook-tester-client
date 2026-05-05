import { motion, AnimatePresence } from 'framer-motion';
import { WebhookCard } from './WebhookCard';
import { Skeleton } from '../ui/Skeleton';

const WebhookList = ({ webhooks, loading, onSelect, onDelete, onCopy }) => {
  if (loading && webhooks.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
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
