import { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Loader2 } from 'lucide-react';

const CreateWebhookModal = ({ open, onOpenChange, onSubmit, loading }) => {
  const [form, setForm] = useState({ name: '', description: '', secret: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    try {
      await onSubmit(form);
      setForm({ name: '', description: '', secret: '' });
      onOpenChange(false);
    } catch (error) {
      // Error handling is managed by the caller (App.jsx)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Create New Webhook</DialogTitle>
        <DialogDescription>Set up a new endpoint to start receiving incoming requests.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Name *</label>
          <Input
            required
            autoComplete="off"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Stripe Integration"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Description</label>
          <Textarea
            value={form.description}
            autoComplete="off"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this webhook for?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Secret <span className="text-xs text-zinc-500 font-normal">(Optional Bearer Token)</span>
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.secret}
            onChange={(e) => setForm({ ...form, secret: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.name.trim()} className="min-w-[100px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Webhook'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export { CreateWebhookModal };
