import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '../lib/auth';
import { api } from '../lib/api';
import FormRenderer from '../components/FormRenderer';
import type { FormField } from '../components/FormRenderer';
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormFill({ user }: { user: User }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get('id');
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingDraft, setExistingDraft] = useState<any>(null);

  useEffect(() => {
    if (!formId) { setError('No form specified'); setLoading(false); return; }
    Promise.all([
      api.get(`/forms?id=${formId}`),
      api.get(`/submissions?form_id=${formId}&user_id=${user.id}`)
    ]).then(([f, subs]) => {
      setForm(f);
      const draft = (subs || []).find((s: any) => s.is_draft);
      if (draft) setExistingDraft(draft);
      const existing = (subs || []).find((s: any) => !s.is_draft);
      if (existing) {
        setExistingDraft(existing);
        if (f.status !== 'active') {
          setSubmitted(true);
        }
      }
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [formId, user.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (error) return (
    <div className="max-w-xl mx-auto text-center py-16">
      <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
      <h2 className="text-lg font-bold mb-2">Error</h2>
      <p className="text-sm text-muted">{error}</p>
      <button onClick={() => navigate('/forms')} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Back to Forms</button>
    </div>
  );

  if (!form) return null;

  if (submitted) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={40} />
      </div>
      <h2 className="text-xl font-bold font-heading mb-2">Submission Complete!</h2>
      <p className="text-sm text-muted mb-2">Your response for \"{form.title}\" has been recorded successfully.</p>
      {(form.form_type === 'quiz' || form.form_type === 'multi') && (
        <p className="text-sm text-muted">Scores are calculated by the system and are not visible to participants.</p>
      )}
      <button onClick={() => navigate('/submissions')} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover">View My Submissions</button>
    </motion.div>
  );

  if (form.status === 'expired' || (form.expires_at && new Date(form.expires_at) < new Date())) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Clock size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-lg font-bold mb-2">Form Expired</h2>
        <p className="text-sm text-muted">This form is no longer accepting responses.</p>
        <button onClick={() => navigate('/forms')} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Back to Forms</button>
      </div>
    );
  }

  let fields: FormField[] = [];
  try { fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : (form.fields || []); } catch { fields = []; }
  let settings: any = {};
  try { settings = typeof form.settings === 'string' ? JSON.parse(form.settings) : (form.settings || {}); } catch {}
  let initialValues: Record<string, any> = {};
  if (existingDraft?.responses) {
    try { initialValues = typeof existingDraft.responses === 'string' ? JSON.parse(existingDraft.responses) : existingDraft.responses; } catch {}
  }

  if (fields.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <FileText size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-lg font-bold mb-2">No Fields Configured</h2>
        <p className="text-sm text-muted">This form doesn't have any fields yet. Please contact the administrator.</p>
        <button onClick={() => navigate('/forms')} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Back to Forms</button>
      </div>
    );
  }

  const handleSubmit = async (responses: Record<string, any>, score?: number) => {
    try {
      if (existingDraft?.is_draft) {
        await api.put('/submissions', { id: existingDraft.id, responses, status: 'submitted', is_draft: false, score: score ?? null });
      } else if (existingDraft && !existingDraft.is_draft) {
        await api.put('/submissions', { id: existingDraft.id, responses, score: score ?? existingDraft.score });
      } else {
        await api.post('/submissions', {
          form_id: form.id, user_id: user.id, user_name: user.name, user_email: user.email,
          form_title: form.title, responses, status: 'submitted', score: score ?? null, is_draft: false
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      alert('Submission failed: ' + err.message);
    }
  };

  const handleSaveDraft = async (responses: Record<string, any>) => {
    try {
      if (existingDraft) {
        await api.put('/submissions', { id: existingDraft.id, responses, is_draft: true });
      } else {
        const result = await api.post('/submissions', {
          form_id: form.id, user_id: user.id, user_name: user.name, user_email: user.email,
          form_title: form.title, responses, status: 'submitted', is_draft: true
        });
        setExistingDraft(result);
      }
    } catch (err: any) {
      console.error('Draft save failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/forms')} className="flex items-center gap-2 text-sm text-muted hover:text-fg mb-4">
        <ArrowLeft size={16} /> Back to Forms
      </button>
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sidebar to-sidebar-light p-6 text-white">
          <h1 className="text-lg font-bold font-heading">{form.title}</h1>
          {form.description && <p className="text-sm text-blue-200 mt-1">{form.description}</p>}
          <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full capitalize">{form.form_type} form</span>
            {form.expires_at && <span className="bg-white/15 px-2.5 py-0.5 rounded-full">Due: {new Date(form.expires_at).toLocaleDateString()}</span>}
            {settings.time_limit && <span className="bg-amber-500/30 px-2.5 py-0.5 rounded-full">\u23f1 {settings.time_limit} min</span>}
            {existingDraft?.is_draft && <span className="bg-amber-500/30 px-2.5 py-0.5 rounded-full">Resuming draft</span>}
          </div>
        </div>
        <div className="p-6">
          <FormRenderer
            fields={fields}
            formType={form.form_type}
            settings={settings}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            viewMode="user"
          />
        </div>
      </div>
    </div>
  );
}
