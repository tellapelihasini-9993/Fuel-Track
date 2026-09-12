import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      const res = await api.getAuditLogs({
        action: filterAction || undefined,
        entity_type: filterEntity || undefined
      });
      setLogs(res.auditLogs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterEntity]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white shadow-lg shadow-slate-700/30">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white font-display">
                PESO-Ready Compliance & Audit Log
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                IMMUTABLE AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Statutory verification trail for pricing, dispatches, IoT flow calibrations, and safety events
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by action (e.g. ORDER_CREATED, DISPENSING, TANKER)..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-transparent text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Entity Types</option>
          <option value="order">Orders</option>
          <option value="tanker">Tankers</option>
          <option value="fuel_tank">Fuel Tanks</option>
          <option value="user">Users</option>
          <option value="safety_check">Safety SOS</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl cyber-glass border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10 font-mono">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details (JSON)</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold text-slate-100 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-slate-200">{log.user_name || 'System Auto'}</div>
                    <span className="text-[10px] text-slate-500 uppercase">{log.user_role || 'CORE'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-orange-400 font-bold">{log.entity_type}</span>
                    {log.entity_id && <span className="text-slate-500 block text-[10px]">#{log.entity_id}</span>}
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-slate-400" title={log.details_json}>
                    {log.details_json}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
