// Vite entry. Loads design tokens + the virtual module that bundles all
// legacy .jsx files. app.jsx (last file in the bundle) calls
// ReactDOM.createRoot itself, so this entry just imports for side effects.

// Surface any boot-time error directly on the page instead of leaving a
// silent white screen — production users have no devtools, and Vercel's
// minified stacks are unreadable. This handler shows the first error's
// message + stack inside #root so the cause is visible at a glance.
function showBootError(label, err) {
  const root = document.getElementById('root');
  const msg = (err && (err.message || String(err))) || 'Unknown error';
  const stack = (err && err.stack) || '';
  const html =
    '<div style="font-family:ui-monospace,Menlo,monospace;padding:24px;max-width:760px;margin:24px auto;background:#fff;border:1px solid #f5c2c7;border-radius:8px;color:#842029;">' +
      '<div style="font-weight:700;margin-bottom:8px;">App failed to start (' + label + ')</div>' +
      '<div style="white-space:pre-wrap;font-size:13px;">' + msg.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;') + '</div>' +
      (stack ? '<pre style="margin-top:12px;font-size:11px;color:#6b7280;white-space:pre-wrap;">' + stack.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;') + '</pre>' : '') +
    '</div>';
  if (root) root.innerHTML = html;
}
window.addEventListener('error', (e) => showBootError('window.onerror', e.error || e));
window.addEventListener('unhandledrejection', (e) => showBootError('unhandledrejection', e.reason));

// Static imports below — any boot-time throw is caught by the window.error
// / unhandledrejection handlers registered above and surfaced on screen.
import '../tokens.css';
import 'virtual:dca-legacy.jsx';
