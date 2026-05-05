import { motion } from 'framer-motion';
import { Copy, Trash2, Globe, Calendar, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { formatUserDate } from '../../utils/formatUserDate';

const WebhookCard = ({ webhook, onSelect, onDelete, onCopy }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className="group cursor-pointer border-zinc-800 hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300 h-full flex flex-col overflow-hidden"
        onClick={() => onSelect(webhook)}
      >
        <CardHeader className="flex flex-row items-start justify-between p-6 pb-2 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-1 truncate">
                {webhook.name}
              </h3>
              <Badge variant={webhook.is_active ? 'success' : 'error'} className="shrink-0">
                {webhook.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {webhook.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 italic leading-relaxed">
                {webhook.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shrink-0">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white sm:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(webhook.endpoint);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-400 sm:bg-transparent hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(webhook.id, webhook.name);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1" />

        <CardContent className="p-6 pt-4 shrink-0">
          <div className="flex flex-col gap-3 text-[11px] text-zinc-500 border-t border-zinc-800/50 pt-4">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <span className="font-mono text-zinc-400 truncate tracking-tight">{webhook.endpoint}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span>
                  {webhook.total_requests || 0} request{webhook.total_requests === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span>{formatUserDate(webhook.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { WebhookCard };
