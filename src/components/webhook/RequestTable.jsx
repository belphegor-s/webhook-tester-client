import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ClipboardCopy, Globe, User, Clock, Monitor } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatUserDate } from '../../utils/formatUserDate';
import { cn } from '../../lib/utils';

const RequestTable = ({ requests, onCopy }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'info';
      case 'POST':
        return 'success';
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
        <Monitor className="h-10 w-10 text-zinc-700 mb-4" />
        <p className="text-zinc-400">Waiting for requests...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden w-full max-w-full">
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[600px] md:min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">Method</TableHead>
              <TableHead>Path / ID</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead className="hidden lg:table-cell">Response</TableHead>
              <TableHead className="text-right">Created At</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <Fragment key={request.id}>
                <TableRow className="cursor-pointer group" onClick={() => toggleRow(request.id)}>
                  <TableCell>
                    <Badge variant={getMethodColor(request.method)}>{request.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-zinc-400">ID: {String(request.id)}...</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-zinc-400 text-xs">{request.ip_address}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-zinc-400 text-xs">{request.response_time ? `${request.response_time}ms` : '-'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-zinc-400 text-xs whitespace-nowrap">{formatUserDate(request.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform duration-200', expandedRows[request.id] && 'rotate-180')} />
                  </TableCell>
                </TableRow>
                <AnimatePresence>
                  {expandedRows[request.id] && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-zinc-950/50 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                <User className="h-4 w-4 text-zinc-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase text-zinc-500 font-bold">User Agent</span>
                                  <span className="text-xs text-zinc-300 truncate max-w-[200px]">{request.user_agent}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                <Globe className="h-4 w-4 text-zinc-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase text-zinc-500 font-bold">IP Address</span>
                                  <span className="text-xs text-zinc-300">{request.ip_address}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                <Clock className="h-4 w-4 text-zinc-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase text-zinc-500 font-bold">Response Time</span>
                                  <span className="text-xs text-zinc-300">{request.response_time ? `${request.response_time}ms` : 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {['headers', 'body', 'query_params'].map((key) => (
                              <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">{key.replace('_', ' ')}</h4>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-500 hover:text-white" onClick={() => onCopy(request[key])}>
                                    <ClipboardCopy className="h-3 w-3 mr-2" />
                                    Copy
                                  </Button>
                                </div>
                                <div className="rounded-lg overflow-hidden border border-zinc-800">
                                  <SyntaxHighlighter
                                    language="json"
                                    style={atomDark}
                                    customStyle={{
                                      margin: 0,
                                      padding: '1rem',
                                      fontSize: '0.75rem',
                                      background: '#09090b',
                                    }}
                                  >
                                    {(() => {
                                      try {
                                        const parsed = JSON.parse(request[key]);
                                        return JSON.stringify(parsed, null, 2);
                                      } catch {
                                        return request[key] || '{}';
                                      }
                                    })()}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export { RequestTable };
