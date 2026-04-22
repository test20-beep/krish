import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from '../lib/auth';
import { api } from '../lib/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { UserPlus, Send, Copy, Link2, Upload, RefreshCw, QrCode, MessageSquare } from 'lucide-react';

export default function Nominations({ user }: { user: User }) {
  const [searchParams] = useSearchParams();
  const initialFormId = parseInt(searchParams.get('form_id') || '0');
  
  const [nominations, setNominations] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedForm, setSelectedForm] = useState<number>(initialFormId);
  const [addForm, setAddForm] = useState({ teacher_name: '', teacher_email: '', teacher_phone: '', link_type: 'otp' });
  const [bulkText, setBulkText] = useState('');

  const schoolCode = user.school_code || (user.email?.match(/^head\.([a-z0-9]+)@/i)?.[1]?.toUpperCase()) || '';

  const fetchData = async () => {
    try {
      const [n, f] = await Promise.all([
        api.get(`/nominations?functionary_id=${user.id}`),
        api.get('/forms?status=active')
      ]);
      setNominations(n); setForms(f.filter((fm: any) => fm.form_type === 'nomination'));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  // Smart filter: if form_id is provided but no nominations exist for it, show all
  useEffect(() => {
    if (initialFormId && nominations.length > 0) {
      const hasNomsForForm = nominations.some(n => n.form_id === initialFormId);
      if (!hasNomsForForm) {
        setSelectedForm(0);
      }
    }
  }, [nominations, initialFormId]);

  const nomsByForm = (formId: number) => nominations.filter(n => n.form_id === formId);

  const handleAddTeacher = async () => {
    if (!selectedForm) return alert('Select a form first');
    await api.post('/nominations', {
      form_id: selectedForm, functionary_id: user.id, teacher_name: addForm.teacher_name,
      teacher_email: addForm.teacher_email, teacher_phone: addForm.teacher_phone,
      school_code: schoolCode, link_type: addForm.link_type
    });
    setShowAdd(false); setAddForm({ teacher_name: '', teacher_email: '', teacher_phone: '', link_type: 'otp' }); fetchData();
  };

  const handleBulkAdd = async () => {
    if (!selectedForm) return alert('Select a form first');
    const lines = bulkText.trim().split('\n').filter(l => l.trim());
    const nomList = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return { form_id: selectedForm, functionary_id: user.id, teacher_name: parts[0], teacher_email: parts[1], teacher_phone: parts[2] || '', school_code: schoolCode, link_type: 'otp' };
    });
    await api.post('/nominations', { action: 'bulk-nominate', nominations: nomList });
    setShowBulk(false); setBulkText(''); fetchData();
  };

  const resendInvite = async (nom: any) => {
    await api.put('/nominations', { id: nom.id, reminder_count: (nom.reminder_count || 0) + 1, last_reminder_at: new Date().toISOString() });
    alert(`Reminder sent to ${nom.teacher_name}! (simulated)`);
    fetchData();
  };

  const copyLink = (nom: any) => {
    const link = `${window.location.origin}/form/fill?token=${nom.unique_token}&sc=${nom.school_code}`;
    navigator.clipboard.writeText(link).then(() => alert('Link copied!'));
  };

  const columns = [
    { key: 'teacher_name', label: 'Teacher', sortable: true, render: (v: string, row: any) => (
      <div><p className="font-medium text-sm">{v}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{row.teacher_email}</p></div>) },
    { key: 'school_code', label: 'School', render: (v: string) => <span className="text-xs font-mono font-bold text-primary">{v}</span> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'link_type', label: 'Access', render: (v: string) => <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">{v}</span> },
    { key: 'reminder_count', label: 'Reminders', render: (v: number) => <span className="text-xs text-slate-500 dark:text-slate-400">{v || 0} sent</span> },
    { key: 'invited_at', label: 'Invited', sortable: true, render: (v: string) => v ? <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(v).toLocaleDateString()}</span> : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold font-heading">Nominations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage teacher nominations for school <span className="font-bold text-primary">{schoolCode}</span></p></div>
        <div className="flex items-center gap-2">
          <select value={selectedForm} onChange={e => setSelectedForm(parseInt(e.target.value))} className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none">
            <option value={0}>Select Form</option>{forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select>
          <button onClick={() => setShowBulk(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:bg-slate-900"><Upload size={14} /> CSV Import</button>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover min-h-[44px]"><UserPlus size={16} /> Add Teacher</button>
        </div>
      </div>

      {/* Nomination Limits */}
      {forms.filter(f => !selectedForm || f.id === selectedForm).map(f => {
        const noms = nomsByForm(f.id);
        let maxNom = 5;
        try { const s = typeof f.settings === 'string' ? JSON.parse(f.settings) : f.settings; maxNom = s?.max_nominations || 5; } catch {}
        return (
          <div key={f.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">{f.title}</h3>
              <span className={`text-xs font-bold ${noms.length >= maxNom ? 'text-danger' : 'text-accent-green'}`}>{noms.length}/{maxNom} nominations</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden"><div className={`h-full rounded-full ${noms.length >= maxNom ? 'bg-danger' : 'bg-accent-green'}`} style={{ width: `${Math.min((noms.length / maxNom) * 100, 100)}%` }} /></div>
            <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>✓ {noms.filter(n => n.status === 'completed').length} completed</span>
              <span>○ {noms.filter(n => n.status === 'in_progress').length} in progress</span>
              <span>✉ {noms.filter(n => n.status === 'invited').length} invited</span>
            </div>
          </div>
        );
      })}

      <DataTable columns={columns} data={nominations.filter(n => !selectedForm || n.form_id === selectedForm)} loading={loading} searchPlaceholder="Search teachers..."
        actions={(row: any) => (
          <div className="flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); copyLink(row); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-primary" title="Copy Link"><Link2 size={14} /></button>
            {row.status === 'invited' && <button onClick={e => { e.stopPropagation(); resendInvite(row); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-amber-500" title="Resend"><RefreshCw size={14} /></button>}
          </div>)}
      />

      {/* Add Teacher Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Teacher Nomination">
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Teacher Name</label>
            <input type="text" value={addForm.teacher_name} onChange={e => setAddForm(p => ({ ...p, teacher_name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none" placeholder="Full name" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Email</label>
            <input type="email" value={addForm.teacher_email} onChange={e => setAddForm(p => ({ ...p, teacher_email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none" placeholder="teacher@email.com" /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Phone</label>
            <input type="tel" value={addForm.teacher_phone} onChange={e => setAddForm(p => ({ ...p, teacher_phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none" placeholder="+91..." /></div>
          <div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">Access Type</label>
            <select value={addForm.link_type} onChange={e => setAddForm(p => ({ ...p, link_type: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none">
              <option value="otp">OTP Required</option><option value="direct">Direct Link (No Login)</option></select></div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">School code <span className="font-bold">{schoolCode}</span> will be auto-attached. Teacher account auto-created if new.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-900">Cancel</button>
            <button onClick={handleAddTeacher} className="px-6 py-2 bg-primary text-white text-sm rounded-xl font-semibold hover:bg-primary-hover">Add & Invite</button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Import Teachers" size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">CSV Format: Teacher Name, Email, Phone (optional)</p>
            <p className="text-[10px] text-blue-600 mt-1">Example: Anita Singh, anita@school.edu, +919876543216</p>
          </div>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8} placeholder="Paste CSV data..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm outline-none font-mono resize-none" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowBulk(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-900">Cancel</button>
            <button onClick={handleBulkAdd} disabled={!bulkText.trim()} className="px-6 py-2 bg-primary text-white text-sm rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-50">Import & Invite</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
