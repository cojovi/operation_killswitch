import { createRoot } from 'react-dom/client';
import '../src/index.css';
import type { UserConfig } from '../src/lib/api';

const root = createRoot(document.getElementById('root')!);
const isolated = import.meta.env.DEV
  && import.meta.env.VITE_SUPABASE_URL === 'http://127.0.0.1:9'
  && import.meta.env.VITE_SUPABASE_ANON_KEY === 'preview-only-not-a-credential';

// Do not import the console/API client until the disconnected configuration is verified.
if (!isolated) {
  root.render(<main style={{ padding: 40, color: '#f4bc63', fontFamily: 'monospace' }}>
    <h1>Preview configuration required</h1>
    <p>Use the disconnected preview command in the README. This page has not loaded the API client.</p>
  </main>);
} else {
  void Promise.all([import('../src/components/Console'), import('../src/components/Countdown')]).then(([{ default: Console }, { default: Countdown }]) => {
    const config: UserConfig = {
      status: 'armed', interval_minutes: 1440,
      next_trigger_at: '2040-01-02T12:00:00.000Z', last_checkin_at: '2040-01-01T12:00:00.000Z',
      recipient_email: 'recipient@example.com', operator_email: 'operator@example.com', cc_emails: [],
      email_subject: 'Project handover', email_message: 'Documentation and next steps for the project.',
      triggered_at: null, callsign: 'DEMO-01', show_on_wall: false, account_status: 'approved', is_admin: false,
      denial_reason: null,
      files: [{ id: '00000000-0000-4000-8000-000000000001', file_name: 'project-handover.txt', mime_type: 'text/plain', size_bytes: 2048, created_at: '2040-01-01T12:00:00.000Z' }],
    };
    root.render(<main className="crt min-h-screen bg-void text-steel" style={{ padding: '28px 28px 64px' }}>
      <header style={{ maxWidth: 1152, margin: '0 auto 32px', borderBottom: '1px solid #493b27', paddingBottom: 20 }}>
        <p className="font-mono text-amber" style={{ fontSize: 11, letterSpacing: 3 }}>DOCUMENTATION PREVIEW / FICTIONAL DATA / READ ONLY</p>
        <h1 className="font-display" style={{ marginTop: 12, fontSize: 24, letterSpacing: 4 }}>OPERATION KILL SWITCH</h1>
        <p className="font-mono text-steel-dim" style={{ marginTop: 12, fontSize: 12 }}>Frozen sample clock. Controls are inactive. No files uploaded or emails sent.</p>
      </header>
      <div ref={node => node?.setAttribute('inert', '')} aria-hidden="true" style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ marginBottom: 38 }}><Countdown remaining={{ days: 0, hours: 23, minutes: 42, seconds: 18, totalMs: 85338000 }} status="armed" urgency="normal" intervalMinutes={1440} /></div>
        <Console config={config} onConfig={() => {}} onLogout={() => {}} />
      </div>
      <p className="font-mono text-steel-dim" style={{ maxWidth: 1152, margin: '24px auto 0', fontSize: 12 }}>Static view of the production Console and Countdown components: check-in controls, timing, payload registry, recipients, and identity settings. For a text walkthrough, see the project README.</p>
    </main>);
  });
}
