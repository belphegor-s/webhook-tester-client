import { useState, useEffect, Fragment } from 'react';
import { Plus, Trash2, Copy, Globe, ArrowLeft, ChevronDown, ChevronUp, ClipboardCopy, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const WebhookTester = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const [webhookForm, setWebhookForm] = useState({ name: '', description: '', secret: '' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webhooks`);
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      showToast('Failed to fetch webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookRequests = async (webhookId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webhooks/${webhookId}/requests`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      showToast('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async (e) => {
    e.preventDefault();

    if (!webhookForm.name.trim()) {
      showToast('Please enter a webhook name', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookForm),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setWebhookForm({ name: '', description: '', secret: '' });
        fetchWebhooks();
        showToast('Webhook created successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error?.error || 'Failed to create webhook', 'error');
      }
    } catch (error) {
      showToast('Failed to create webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webhooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWebhooks();
        showToast('Webhook deleted successfully', 'success');
      } else {
        showToast('Failed to delete webhook', 'error');
      }
    } catch (error) {
      showToast('Failed to delete webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = (endpoint) => {
    const url = `${API_BASE.replace('/api', '')}/webhook/${endpoint}`;
    navigator.clipboard.writeText(url);
    showToast('Webhook URL copied to clipboard', 'success');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const viewWebhookRequests = (webhook) => {
    setSelectedWebhook(webhook);
    fetchWebhookRequests(webhook.id);
  };

  const backToWebhooks = () => {
    setSelectedWebhook(null);
    setRequests([]);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              toast.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : toast.type === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedWebhook && (
                <button onClick={backToWebhooks} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Webhook Tester</h1>
                {selectedWebhook && <p className="text-sm text-gray-400">Requests for {selectedWebhook.name}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!selectedWebhook && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Webhook</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!selectedWebhook && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Your Webhooks</h2>
              <span className="text-sm text-gray-400">
                {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-200 cursor-pointer"
                  onClick={() => viewWebhookRequests(webhook)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-white">{webhook.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${webhook.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{webhook.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="font-mono">{webhook.endpoint}</span>
                        <span>•</span>
                        <span>{webhook.total_requests || 0} requests</span>
                        <span>•</span>
                        <span>{formatDate(webhook.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyWebhookUrl(webhook.endpoint);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Copy webhook URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWebhook(webhook.id, webhook.name);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedWebhook && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Requests</h2>
                <span className="text-sm text-gray-400">
                  {requests.length} request{requests.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => fetchWebhookRequests(selectedWebhook.id)} className="text-gray-400 hover:text-white transition-colors" title="Refresh">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Response Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {requests.map((request) => {
                        const isExpanded = expandedRows[request.id];
                        return (
                          <Fragment key={request.id}>
                            <tr className="hover:bg-white/5 select-none cursor-pointer" onClick={() => toggleRow(request.id)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    request.method === 'GET'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : request.method === 'POST'
                                      ? 'bg-green-500/20 text-green-400'
                                      : request.method === 'PUT'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {request.method}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.ip_address}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate">{request.user_agent}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.response_time ?? '-'}ms</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(request.created_at).toLocaleString()}</td>
                              <td className="px-2 text-gray-300">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</td>
                            </tr>
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.tr
                                  className="bg-black/10"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-100">
                                    <div className="space-y-4">
                                      {['headers', 'body', 'query_params'].map((key, i) => (
                                        <div key={`request-${i}`}>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                                            <button onClick={() => copyToClipboard(request[key])} className="text-gray-400 hover:text-white" title="Copy to clipboard">
                                              <ClipboardCopy size={16} />
                                            </button>
                                          </div>
                                          <SyntaxHighlighter
                                            language="json"
                                            style={atomDark}
                                            customStyle={{
                                              padding: '1em',
                                              lineHeight: '1.4',
                                              borderRadius: '0.5em',
                                            }}
                                          >
                                            {(() => {
                                              try {
                                                return JSON.stringify(JSON.parse(request[key]), null, 2);
                                              } catch {
                                                return request[key];
                                              }
                                            })()}
                                          </SyntaxHighlighter>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {requests.length === 0 && <div className="text-center py-8 text-gray-400">No requests received yet for this webhook.</div>}
            </div>
          </div>
        )}

        {webhooks.length === 0 && !loading && !selectedWebhook && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No webhooks yet</h3>
            <p className="text-gray-400 mb-4">Create your first webhook to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Webhook</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Webhook Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.form
              key="create-webhook-modal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/20"
              onSubmit={createWebhook}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create New Webhook</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={webhookForm.name}
                    onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="My Webhook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={webhookForm.description}
                    onChange={(e) => setWebhookForm({ ...webhookForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    rows="3"
                    placeholder="Description of your webhook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Secret</label>
                  <input
                    type="password"
                    value={webhookForm.secret}
                    onChange={(e) => setWebhookForm({ ...webhookForm, secret: e.target.value })}
                    className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    placeholder="Optional webhook secret"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{loading ? 'Creating...' : 'Create'}</span>
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebhookTester;
