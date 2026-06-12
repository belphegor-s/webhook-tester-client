import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Globe, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useWebhooks } from './hooks/useWebhooks';
import { useRequests } from './hooks/useRequests';
import { useAuth } from './hooks/useAuth';

import { Navbar } from './components/layout/Navbar';
import { Container } from './components/layout/Container';
import { WebhookList } from './components/webhook/WebhookList';
import { RequestTable } from './components/webhook/RequestTable';
import { CreateWebhookModal } from './components/webhook/CreateWebhookModal';
import { LoginPage } from './components/LoginPage';
import { Button } from './components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/Dialog';
import ToastContainer from './components/ToastContainer';

const WEBHOOK_BASE = import.meta.env.VITE_WEBHOOK_BASE_URL || 'https://hooks.procd.cc';

const App = () => {
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <AuthenticatedApp logout={logout} />;
};

const AuthenticatedApp = ({ logout }) => {
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [webhookToDelete, setWebhookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    webhooks,
    loading: webhooksLoading,
    totalPages: totalWebhookPages,
    page: webhookPage,
    setPage: setWebhookPage,
    fetchWebhooks,
    createWebhook: apiCreateWebhook,
    deleteWebhook: apiDeleteWebhook,
  } = useWebhooks();

  const { requests, loading: requestsLoading, totalPages: totalRequestPages, page: requestPage, setPage: setRequestPage, fetchRequests } = useRequests(selectedWebhook?.endpoint);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleCreateWebhook = async (formData) => {
    setIsCreating(true);
    try {
      await apiCreateWebhook(formData);
      showToast('Webhook created successfully', 'success');
      setShowCreateModal(false);
    } catch (error) {
      showToast(error.message || 'Failed to create webhook', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWebhook = (id, name) => {
    setWebhookToDelete({ id, name });
  };

  const confirmDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    setIsDeleting(true);
    try {
      await apiDeleteWebhook(webhookToDelete.id);
      showToast('Webhook deleted successfully', 'success');
      if (selectedWebhook?.id === webhookToDelete.id) {
        setSelectedWebhook(null);
      }
    } catch (error) {
      showToast('Failed to delete webhook', 'error');
    } finally {
      setIsDeleting(false);
      setWebhookToDelete(null);
    }
  };

  const copyWebhookUrl = (endpoint) => {
    const url = `${WEBHOOK_BASE}/webhook/${endpoint}`;
    navigator.clipboard.writeText(url);
    showToast('Webhook URL copied', 'info');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'info');
  };

  const handleSelectWebhook = (webhook) => {
    setSelectedWebhook(webhook);
    setRequestPage(0);

    const url = new URL(window.location);
    url.searchParams.set('webhook_endpoint', webhook.endpoint);
    url.searchParams.set('req_page', 1);
    url.searchParams.delete('page');
    window.history.pushState({ wh: webhook.endpoint, rp: 1 }, '', url);
  };

  const handleBackToWebhooks = () => {
    setSelectedWebhook(null);
    const url = new URL(window.location);
    url.searchParams.delete('webhook_endpoint');
    url.searchParams.delete('req_page');
    url.searchParams.set('page', webhookPage + 1);
    window.history.pushState({ p: webhookPage + 1 }, '', url);
  };

  const handlePageChange = (newPage) => {
    setWebhookPage(newPage);
    const url = new URL(window.location);
    url.searchParams.set('page', newPage + 1);
    window.history.pushState({ p: newPage + 1 }, '', url);
  };

  const handleRequestPageChange = (newPage) => {
    setRequestPage(newPage);
    const url = new URL(window.location);
    url.searchParams.set('req_page', newPage + 1);
    window.history.pushState({ wh: selectedWebhook.endpoint, rp: newPage + 1 }, '', url);
  };

  // Sync state from URL
  const syncFromUrl = useCallback(() => {
    const url = new URL(window.location);
    const whEndpoint = url.searchParams.get('webhook_endpoint');
    const p = parseInt(url.searchParams.get('page')) || 1;
    const rp = parseInt(url.searchParams.get('req_page')) || 1;

    if (webhooks.length > 0) {
      if (whEndpoint) {
        const wh = webhooks.find((w) => w.endpoint === whEndpoint);
        if (wh) {
          setSelectedWebhook(wh);
          setRequestPage(rp - 1);
        }
      } else {
        setSelectedWebhook(null);
        setWebhookPage(p - 1);
      }
    }
  }, [webhooks, setRequestPage, setWebhookPage]);

  // Initial load and back/forward buttons
  useEffect(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [syncFromUrl]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30 overflow-x-clip">
      <ToastContainer toasts={toasts} />

      <Navbar selectedWebhook={selectedWebhook} onBack={handleBackToWebhooks} onNewWebhook={() => setShowCreateModal(true)} />

      <Container className="relative">
        <AnimatePresence mode="wait">
          {!selectedWebhook ? (
            <motion.div
              key="webhooks-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your Webhooks</h1>
                  <p className="text-zinc-500 mt-1 text-sm sm:text-base">Manage and monitor your endpoints.</p>
                </div>
              </div>

              {webhooks.length === 0 && !webhooksLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-zinc-900 p-6 mb-4">
                    <Globe className="h-10 w-10 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No webhooks yet</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto mt-2 text-sm">Create your first webhook to start receiving and inspecting incoming requests.</p>
                  <Button onClick={() => setShowCreateModal(true)} className="mt-6 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {webhooksLoading && webhooks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none transition-opacity">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 w-full rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
                      ))}
                    </div>
                  ) : (
                    <WebhookList webhooks={webhooks} loading={webhooksLoading} onSelect={handleSelectWebhook} onDelete={handleDeleteWebhook} onCopy={copyWebhookUrl} />
                  )}

                  {totalWebhookPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" size="sm" disabled={webhookPage === 0} onClick={() => handlePageChange(webhookPage - 1)} className="gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <span className="text-xs sm:text-sm text-zinc-500 font-medium">
                        Page {webhookPage + 1} of {totalWebhookPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={webhookPage === totalWebhookPages - 1} onClick={() => handlePageChange(webhookPage + 1)} className="gap-2">
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">{selectedWebhook.name}</h2>
                    {requestsLoading && <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-zinc-500 text-[10px] sm:text-sm">
                    <span className="font-mono text-[9px] sm:text-xs bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 truncate max-w-full">{selectedWebhook.endpoint}</span>
                    <span className="hidden sm:inline text-zinc-700">•</span>
                    <span className="whitespace-nowrap">{requests.length} requests in this page</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => fetchRequests()} title="Refresh" className="h-9 w-9">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyWebhookUrl(selectedWebhook.endpoint)} className="flex-1 sm:flex-none h-9">
                    Copy URL
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {requestsLoading && requests.length > 0 ? (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden min-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="mt-4 text-sm text-zinc-500 font-medium">Fetching requests...</span>
                    </div>
                  </div>
                ) : (
                  <RequestTable requests={requests} onCopy={copyToClipboard} />
                )}

                {totalRequestPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm" disabled={requestPage === 0} onClick={() => handleRequestPageChange(requestPage - 1)} className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="text-xs sm:text-sm text-zinc-500 font-medium">
                      Page {requestPage + 1} of {totalRequestPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={requestPage === totalRequestPages - 1} onClick={() => handleRequestPageChange(requestPage + 1)} className="gap-2">
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <CreateWebhookModal open={showCreateModal} onOpenChange={setShowCreateModal} onSubmit={handleCreateWebhook} loading={isCreating} />

      <Dialog
        open={!!webhookToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setWebhookToDelete(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete Webhook</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-zinc-200">"{webhookToDelete?.name}"</span>? This will permanently remove the webhook and all its recorded requests.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setWebhookToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteWebhook} disabled={isDeleting} className="min-w-[100px]">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Webhook'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default App;
