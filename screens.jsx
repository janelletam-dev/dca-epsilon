// DCA Booking Journey — Variant 2 (V2)
// Improvements:
//  • Home: cover/policy pill, ACPs available in next 4h
//  • Categories + concerns consolidated with search
//  • Appt: pre-select next slot, on-page filter dropdowns, prev clinicians,
//          empty-state nudges, what-can-clinicians-do, calendar+range picker
//  • Appt summary step before confirmation
//  • Exit intent → "set a reminder" sheet

const BLUE = '#004EF8';
const BLUE_HEADER = '#0858FF';
const BLUE_50 = '#F1F5FF';
const BLUE_100 = '#E7EFFF';
const BLUE_200 = '#C9DCFF';
const NAVY = '#061731';
const NAVY_700 = '#0E2A5A';
const GREY_BG = '#F4F4F4';
const GREY_BORDER = '#E8EAED';
const GREY_TEXT = '#4B5563';
const GREY_400 = '#9AA3B2';
const GREEN = '#1CAE6A';
const GREEN_100 = '#E3F6EC';
const YELLOW = '#FFB306';
const AMBER_50 = '#FFF7E0';
const AMBER_700 = '#8A5E00';

// ─────────────────────────────────────────────────────────────
// Shared chrome
// ─────────────────────────────────────────────────────────────
function StatusBarOverlay({ tone = 'light' }) {
  const color = '#fff';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px 0', pointerEvents: 'none',
      fontFamily: '-apple-system, "SF Pro", system-ui',
      WebkitFontSmoothing: 'antialiased'
    }}>
      <span style={{ color, fontWeight: 600, fontSize: 15 }}>2:39</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={color}>
          <rect x="0" y="7" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
        </g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
          <path d="M8 2.4c2.1 0 4 .8 5.4 2.2l1-1A8.5 8.5 0 008 1a8.5 8.5 0 00-6.4 2.6l1 1A7.7 7.7 0 018 2.4z" />
          <path d="M8 5.6c1.3 0 2.5.5 3.4 1.4l1-1a6 6 0 00-8.8 0l1 1A4.7 4.7 0 018 5.6z" />
          <circle cx="8" cy="9.5" r="1.4" />
        </svg>
        <svg width="25" height="11" viewBox="0 0 25 11">
          <rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke={color} strokeOpacity="0.5" />
          <rect x="2" y="2" width="11" height="7" rx="1" fill={color} />
          <path d="M23 3.5v4c.6-.2 1-.8 1-1.5v-1c0-.7-.4-1.3-1-1.5z" fill={color} fillOpacity="0.5" />
        </svg>
      </div>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 30, borderRadius: 18, background: '#000'
      }} />
    </div>);
}

function BookingHeader({ go, title = 'Book an appointment', tone = 'blue', onClose }) {
  const bg = tone === 'green' ? GREEN : 'var(--dca-header-bg)';
  const fg = tone === 'green' ? '#fff' : 'var(--dca-header-fg)';
  return (
    <div style={{
      background: bg, color: fg,
      padding: '52px 16px 14px', position: 'relative', zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0
    }}>
      <button
        onClick={() => go(tone === 'green' ? 'home' : 'back')}
        aria-label={tone === 'green' ? 'Home' : 'Back'}
        style={{
          all: 'unset', cursor: 'pointer', padding: 8, marginLeft: -4,
          display: 'flex', alignItems: 'center'
        }}>
        {tone === 'green' ?
        // House icon on the confirmation screen — taps go straight to home,
        // bypassing the booking-flow history (otherwise back lands on the
        // clinician picker, which is confusing post-booking).
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          </svg> :
        <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
            <path d="M9.5 1.5L2 9l7.5 7.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      </button>
      <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.1 }}>{title}</div>
      <button onClick={onClose} aria-label="Close" style={{
        all: 'unset', cursor: 'pointer', padding: 8, marginRight: -4,
        display: 'flex', alignItems: 'center',
        opacity: tone === 'green' ? 0 : 1
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2l12 12M14 2L2 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>);
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        all: 'unset', boxSizing: 'border-box',
        width: '100%', textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '15px 18px', borderRadius: 999,
        background: disabled ? '#C9D2E0' : BLUE,
        color: '#fff', fontWeight: 600, fontSize: 15.5, letterSpacing: -0.1
      }}>
      {children}</button>);
}

function SecondaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', boxSizing: 'border-box',
      width: '100%', textAlign: 'center', cursor: 'pointer',
      padding: '13px 18px', borderRadius: 999,
      border: `1.5px solid ${BLUE}`, color: BLUE, background: '#fff',
      fontWeight: 700, fontSize: 14.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    }}>{children}</button>);
}

function Chevron({ color = '#9AA3B2', size = 14 }) {
  return (
    <svg width={size * 0.6} height={size} viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);
}

function InfoIcon({ size = 16, color = BLUE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <path d="M12 11v6M12 7.5v.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>);
}

function PulseDot({ color = GREEN }) {
  return (
    <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 999, background: color,
        animation: 'dca-pulse 1.6s ease-out infinite'
      }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: color }} />
      <style>{`@keyframes dca-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}`}</style>
    </span>);
}

// ─────────────────────────────────────────────────────────────
// Tab bar (shared)
// ─────────────────────────────────────────────────────────────
function TabBar({ active = 'home' }) {
  const items = [
  { id: 'home', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg> },
  { id: 'appts', label: 'Appointments', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M4 9h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
  { id: 'rx', label: 'Prescriptions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 8h6M9 12h6M12 16v3M10.5 17.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
  { id: 'up', label: 'Uploads', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 19V8l4-4h8a2 2 0 012 2v13a2 2 0 01-2 2H7a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 16v-6m-3 3l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: 'med', label: 'Medical History', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 7a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M14 5v5h5" stroke="currentColor" strokeWidth="2" /></svg> }];

  return (
    <div style={{ background: '#fff', borderTop: `1px solid ${GREY_BORDER}`, padding: '6px 4px 22px', display: 'flex', flexShrink: 0 }}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? BLUE : '#6B7280', padding: '6px 0',
            fontSize: 10, fontWeight: 600
          }}>
            {it.icon}
            <span style={{ letterSpacing: -0.1 }}>{it.label}</span>
          </div>);
      })}
    </div>);
}

// ═════════════════════════════════════════════════════════════
// 01 — HOME (V2)
// ═════════════════════════════════════════════════════════════
function AvailabilityHint({ mode = 'none' }) {
  if (mode === 'noslots') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: AMBER_700, fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: YELLOW, flexShrink: 0 }} />
        <span><strong>No slots today</strong> · earliest tomorrow 7:00am</span>
      </div>);
  }
  if (mode === 'fewhours') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: AMBER_700, fontWeight: 600 }}>
        <PulseDot color={YELLOW} />
        <span><strong>3 clinicians</strong> available in the next 4 hours</span>
      </div>);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: NAVY_700, fontWeight: 600 }}>
      <PulseDot color={GREEN} />
      <span><strong style={{ color: GREEN }}>32 clinicians</strong> available in the next 4 hours</span>
    </div>);
}

function LiveAvailabilityGrid({ mode = 'none' }) {
  const sets = {
    none: {
      ACP: { pct: 0.78, online: 12, total: 15 },
      GP: { pct: 0.32, online: 4, total: 12 },
      MHP: { pct: 0.55, online: 6, total: 11 },
      Physio: { pct: 0.62, online: 5, total: 8 }
    },
    fewhours: {
      ACP: { pct: 0.42, online: 6, total: 15 },
      GP: { pct: 0.18, online: 2, total: 12 },
      MHP: { pct: 0.30, online: 3, total: 11 },
      Physio: { pct: 0.36, online: 3, total: 8 }
    },
    noslots: {
      ACP: { pct: 0.05, online: 0, total: 15 },
      GP: { pct: 0.05, online: 0, total: 12 },
      MHP: { pct: 0.05, online: 1, total: 11 },
      Physio: { pct: 0.05, online: 0, total: 8 }
    }
  };
  const data = sets[mode] || sets.none;
  // Friendly availability tier per clinician type (replaces raw % copy).
  const TIER = {
    ACP: { label: 'Great availability', color: GREEN },
    GP: { label: 'Limited availability', color: '#C7480F' },
    MHP: { label: 'Good availability', color: '#0858FF' },
    Physio: { label: 'Good availability', color: '#0858FF' }
  };
  const items = [
  { label: 'ACP', ...data.ACP },
  { label: 'GP', ...data.GP },
  { label: 'MHP', ...data.MHP },
  { label: 'Physio', ...data.Physio }];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      columnGap: 24, rowGap: 14
    }}>
      {items.map((it) =>
      <div key={it.label}>
          <div style={{ fontSize: 13.5, color: NAVY, fontWeight: 700, letterSpacing: -0.1, marginBottom: 7 }}>{it.label}</div>
          <div style={{
          height: 7, borderRadius: 999, background: '#E6EAF0', overflow: 'hidden', position: 'relative'
        }}>
            <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${Math.max(6, it.pct * 100)}%`,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #0030B5 0%, #0858FF 60%, #2F7BFF 100%)'
          }} />
          </div>
          <div style={{ fontSize: 11, color: TIER[it.label]?.color || GREY_TEXT, fontWeight: 600, marginTop: 5 }}>
            {TIER[it.label]?.label || ''}
          </div>
        </div>
      )}
    </div>);

}

function HomeScreen({ go, state, persona, errorMode = 'none' }) {
  const isB2B = persona === 'b2b';

  // After completing a booking, show a "Join your appointment" tile at the
  // top of the home screen so the user can return to it from the entry point.
  const booked = state && state.clinician;
  let bookedTime = '';
  let bookedDay = 'Today';
  if (booked && state.selectedSlot) {
    const ss = state.selectedSlot;
    const tStart = new Date(BOOKING_NOW); tStart.setHours(0, 0, 0, 0);
    const currentDay = addDays(tStart, ss.day);
    const band = TIME_BANDS.find((b) => b.id === ss.band) || TIME_BANDS[0];
    const sd = slotDate(currentDay, band, ss.h, ss.m);
    bookedTime = fmtTime(ss.h, ss.m);
    const diff = dayDiff(sd, tStart);
    bookedDay = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow'
      : `${DAYS_SHORT[sd.getDay()]} ${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]}`;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: GREY_BG }}>
      <div style={{
        background: BLUE_HEADER, color: '#fff', padding: '52px 16px 18px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <img src="assets/dca-logo.png" alt="DCA" style={{ height: 32, width: 32, flexShrink: 0, display: 'block' }} />
          <button style={{ all: 'unset', cursor: 'pointer', padding: 6 }} aria-label="Menu">
            <svg width="22" height="16" viewBox="0 0 22 16"><g stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="20" y2="2" />
              <line x1="2" y1="8" x2="20" y2="8" />
              <line x1="2" y1="14" x2="20" y2="14" />
            </g></svg>
          </button>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Hi, Test.</div>
        <div style={{ fontSize: 16, fontWeight: 400, opacity: 0.95, marginTop: 2 }}>What can we help you with?</div>
      </div>

      <div style={{ flex: 1, padding: '12px 14px 0', overflow: 'auto' }}>
        {/* Upcoming appointment tile — only after a booking is in state. */}
        {booked && (
          <div data-dca-theme="dca" style={{
            background: '#FFFFFF', border: '1px solid #D7E9FF', borderRadius: 16,
            padding: 16, marginBottom: 12,
            display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#135CFF', letterSpacing: 0.2 }}>
                  YOUR NEXT APPOINTMENT
                </div>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>
                  {bookedDay} at {bookedTime}
                </div>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
                  Video appointment with {booked.name}
                </div>
              </div>
            </div>
            <button
              onClick={() => go('confirmed')}
              style={{
                all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 8, padding: '12px 16px', width: '100%', height: 40,
                background: '#135CFF', borderRadius: 9999,
                boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#EDF6FF',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="13" height="12" rx="2" stroke="#EDF6FF" strokeWidth="1.8"/>
                <path d="M16 10l5-3v10l-5-3v-4z" stroke="#EDF6FF" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              Join your appointment
            </button>
          </div>
        )}

        <CoverageCard persona={persona} />

        <button
          onClick={() => go('emergency')}
          style={{
            all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box',
            background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
            padding: '18px 18px', marginTop: 10,
            boxShadow: '0 1px 2px rgba(6,23,49,0.04)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: NAVY, marginBottom: 6, letterSpacing: -0.2 }}>Book an appointment</div>
              <div style={{ fontSize: 14, color: GREY_TEXT, lineHeight: 1.45 }}>
                Video and phone appointments available 24/7, all year round.
              </div>
            </div>
            <Chevron color={NAVY} />
          </div>
        </button>
      </div>

      <TabBar active="home" />
    </div>);
}

function CoverageCard({ persona }) {
  if (persona === 'b2b') {
    return (
      <div style={{
        background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
        padding: '14px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <ShieldIcon color={GREEN} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, color: NAVY, fontWeight: 700, letterSpacing: -0.2 }}>Your Policy Status</div>
            <div style={{ fontSize: 13.5, color: NAVY, marginTop: 2, lineHeight: 1.4 }}>
              You're covered by <strong>AXA Health · Plan A</strong>. Your appointments are <strong style={{ color: GREEN }}>fully paid for</strong>.
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GREY_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: GREEN, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: GREY_TEXT }}>
              <strong style={{ color: NAVY }}>Active</strong> until 12 Jan 2027
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
          }}>
            See details
            <svg width="6" height="10" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>);
  }
  return (
    <div style={{
      background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
      padding: '14px 16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ShieldIcon color={BLUE} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, color: NAVY, fontWeight: 700, letterSpacing: -0.2 }}>Your Policy Status</div>
          <div style={{ fontSize: 13.5, color: NAVY, marginTop: 2, lineHeight: 1.4 }}>
            Your account is now a <strong>Pay-As-You-Go (PAYG)</strong> plan.
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GREY_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: GREY_TEXT }}>Appointments from</div>
          <div style={{ fontSize: 18, color: NAVY, fontWeight: 700, letterSpacing: -0.3, marginTop: 1 }}>
            £45 <span style={{ fontSize: 12, color: GREY_TEXT, fontWeight: 500 }}>per appointment</span>
          </div>
        </div>
        <button style={{
          all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
        }}>
          See details
          <svg width="6" height="10" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>);
}

function ShieldIcon({ color = '#3D7BFF' }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M11 1.5L1.5 5v8.2c0 6 4.2 9.7 9.5 11.3 5.3-1.6 9.5-5.3 9.5-11.3V5L11 1.5z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    </svg>);
}

// ═════════════════════════════════════════════════════════════
// 02 — Not for emergencies  (alert + member combobox)
// ═════════════════════════════════════════════════════════════
// Theme tokens — sourced from CSS variables so the Tweaks panel can swap
// palette / surface / pace at runtime without rerendering JSX. SVG attribute
// strokes that need to track the brand colour reference CSS vars via inline
// style (using `currentColor`) since SVG attrs themselves don't resolve var().
const EMERG_BLUE = 'var(--dca-primary)';
const EMERG_BLUE_INK = 'var(--dca-primary-ink)';
const EMERG_BLUE_50 = 'var(--dca-tint)';
const EMERG_BORDER_SOFT = 'var(--dca-tint-line)';
const EMERG_BORDER = 'var(--dca-tint-border)';
const EMERG_INK = '#030712';
const EMERG_INK_MUTED = '#4B5563';
const CARD_BG = 'var(--dca-card-bg)';
const CARD_SHADOW = 'var(--dca-card-shadow)';
const CARD_BORDER_W = 'var(--dca-card-border-w)';

function EmergencyAlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.667" stroke={EMERG_INK} strokeWidth="1.333" />
      <path d="M8 7.333V11M8 5.333v.334" stroke={EMERG_INK} strokeWidth="1.333" strokeLinecap="round" />
    </svg>);
}

function ChevronsUpDown({ size = 16, color = EMERG_INK_MUTED }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
      <path d="M4.667 10l3.333 3.333L11.333 10M4.667 6L8 2.667 11.333 6" stroke={color} strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);
}

function EmergencyScreen({ go, onClose }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(192.04deg, ${EMERG_BLUE_50} 0%, #FFFFFF 50%, ${EMERG_BLUE_50} 100%)`
    }}>
      <BookingHeader go={go} onClose={onClose} />

      {/* Scroll container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x)', display: 'flex', flexDirection: 'column', gap: 'var(--dca-shell-gap)' }}>

          {/* Alert card */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
            gap: 12, padding: '12px 16px',
            background: 'var(--dca-card-bg)', border: `1px solid ${EMERG_BORDER_SOFT}`, borderRadius: 10
          }}>
            <div style={{ padding: '4px 0' }}>
              <EmergencyAlertIcon />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 14, lineHeight: '20px',
                color: EMERG_INK
              }}>Not for emergencies</div>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                color: EMERG_INK_MUTED
              }}>
                Our clinicians cannot assess or treat medical emergencies. If your or your child's symptoms worsen while you are waiting for your appointment, you may need to seek more urgent care. In an emergency, please contact emergency services (111/999) or visit your nearest A&amp;E department.
              </div>
              <button
                onClick={() => {}}
                style={{
                  all: 'unset', cursor: 'pointer', marginTop: 4,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
                  color: EMERG_BLUE, borderRadius: 9999
                }}>
                Find urgent care options
              </button>
            </div>
          </div>

          {/* Combobox — who's the appointment for */}
          <MemberCombobox />

          {/* Status messaging */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 20, height: 20, display: 'grid', placeItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.667" stroke={EMERG_INK} strokeWidth="1.333" />
                <path d="M8 7.333V11M8 5.333v.334" stroke={EMERG_INK} strokeWidth="1.333" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{
              flex: 1, minHeight: 20,
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
              color: EMERG_INK, display: 'flex', alignItems: 'center'
            }}>
              Need to book for someone else? <span style={{ color: 'rgb(18, 92, 255)', textDecoration: 'underline' }}>Manage account</span>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'sticky', bottom: 0,
          padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x) 28px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          flexShrink: 0
        }}>
          <button
            onClick={() => go('search')}
            style={{
              all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 8, padding: '12px 16px', width: '100%', height: 40,
              background: EMERG_BLUE,
              boxShadow: '0px 4px 6px -1px rgba(15,55,190,0.05), 0px 2px 4px -2px rgba(15,55,190,0.05)',
              borderRadius: 9999,
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
              color: EMERG_BLUE_50, letterSpacing: 0
            }}>
            Start booking for myself
          </button>
        </div>
      </div>
    </div>);
}

// Combobox: floating-label trigger showing the member with an avatar
function MemberCombobox() {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Floating label — sits on the border */}
      <div style={{
        position: 'absolute', left: 12, top: -8, zIndex: 2,
        padding: '0 4px', display: 'flex', alignItems: 'center', gap: 4,
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 50%, #FFFFFF 50%)'
      }}>
        <span style={{
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
          color: EMERG_BLUE_INK
        }}>Who is this appointment for?</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.667" stroke={EMERG_BLUE} strokeWidth="1.333" />
          <path d="M8 7.333V11M8 5.333v.334" stroke={EMERG_BLUE} strokeWidth="1.333" strokeLinecap="round" />
        </svg>
      </div>

      {/* Trigger */}
      <button
        onClick={() => {}}
        style={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          gap: 8, padding: '8px 16px',
          width: '100%', height: 44,
          background: 'var(--dca-card-bg)',
          border: `1px solid ${EMERG_BORDER}`,
          boxShadow: 'var(--dca-card-shadow)',
          borderRadius: 8
        }}>
        <img
          src="assets/user-sample.png"
          alt=""
          style={{ width: 20, height: 20, borderRadius: 9999, background: EMERG_BORDER, objectFit: 'cover', flexShrink: 0 }}
          onError={(e) => {e.currentTarget.style.background = EMERG_BORDER;e.currentTarget.removeAttribute('src');}} />
        
        <span style={{
          flex: 1, minWidth: 0,
          fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
          color: EMERG_INK, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>Test Demo User (Myself)</span>
        <ChevronsUpDown />
      </button>
    </div>);
}

// ═════════════════════════════════════════════════════════════
// 03 — Select a member
// ═════════════════════════════════════════════════════════════
function MemberScreen({ go, onClose }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 16px' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select a member</h2>
        <button onClick={() => go('search')} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', gap: 12, width: '100%',
          background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
          padding: '14px', marginBottom: 10, boxShadow: '0 1px 2px rgba(6,23,49,0.04)'
        }}>
          <img src="assets/user-sample.png" alt="" style={{ width: 38, height: 38, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} onError={(e) => {e.currentTarget.style.background = '#E8EAED';e.currentTarget.removeAttribute('src');}} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 14.5 }}>Test Demo User</div>
            <div style={{ fontSize: 12.5, color: GREY_TEXT, marginTop: 1 }}>(Myself)</div>
          </div>
          <Chevron />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
          padding: '14px', boxShadow: '0 1px 2px rgba(6,23,49,0.04)'
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: BLUE_100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="9" r="4" stroke={BLUE} strokeWidth="1.8" /><path d="M3 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" /><path d="M18 8v6M15 11h6" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>Need to book for someone else?</div>
            <div style={{ fontSize: 13, color: BLUE, fontWeight: 600, marginTop: 2, textDecoration: 'underline' }}>Manage my account</div>
          </div>
        </div>
      </div>
    </div>);
}

// ═════════════════════════════════════════════════════════════
// 04 — Search & Browse (consolidated categories + concerns)
// ═════════════════════════════════════════════════════════════
const CATEGORIES = [
{ id: 'skin', name: 'Skin, Hair & Nails', sub: 'Acne, Eczema, Hair Concerns, Rash' },
{ id: 'mh', name: 'Mental Health & Wellbeing', sub: 'Anxiety, Low mood, Sleep problems, Stress' },
{ id: 'joints', name: 'Joints and Muscles', sub: 'Back pain, Knee pain, Neck pain, Shoulder pain' },
{ id: 'gut', name: 'Gut Health', sub: 'Bloating, Constipation, Heartburn, Stomach pain' },
{ id: 'wh', name: "Women's health", sub: 'Breast Symptoms, Menopause, Periods, PMS' },
{ id: 'resp', name: 'Respiratory Health', sub: 'Asthma, Cold & Flu, Cough, Covid-19' },
{ id: 'heart', name: 'Heart Health', sub: 'Chest pain, Heart Palpitations, High blood pressure' },
{ id: 'headache', name: 'Headaches & Dizziness', sub: 'Dizziness, Headache, Migraine' },
{ id: 'ent', name: 'Eyes, Ears, Nose & Throat', sub: 'Ear Symptoms, Eye Symptoms, Sinusitis, Sore throat' },
{ id: 'ill', name: 'Minor illnesses', sub: 'Fatigue, Fever, Flu, Hayfever' },
{ id: 'mens', name: "Men's Health", sub: 'Erection issues, Prostate symptoms, UTI' },
{ id: 'followup', name: 'Health Check Follow-Up', sub: 'Follow-up appointment, Health check review, Test results review' }];

const CATEGORY_IMAGES = {
  skin: 'assets/cat-skin.png', ill: 'assets/cat-ill.png', ent: 'assets/cat-ent.png',
  wh: 'assets/cat-wh.png', mh: 'assets/cat-mh.png', gut: 'assets/cat-gut.png',
  heart: 'assets/cat-heart.png', headache: 'assets/cat-headache.png',
  mens: 'assets/cat-mens.png', followup: 'assets/cat-followup.png',
  joints: 'assets/cat-joints.png', resp: 'assets/cat-resp.png'
};

const CONCERNS = [
// Skin, Hair & Nails
{ name: 'Acne', cat: 'skin' }, { name: 'Chickenpox & Shingles', cat: 'skin' },
{ name: 'Cold Sores', cat: 'skin' }, { name: 'Eczema', cat: 'skin' },
{ name: 'Hair Concerns', cat: 'skin' }, { name: 'Moles & Skin Lesions', cat: 'skin' },
{ name: 'Nail Symptoms', cat: 'skin' }, { name: 'Rash', cat: 'skin' },
{ name: 'Warts', cat: 'skin' },
// Mental Health & Wellbeing
{ name: 'Anxiety', cat: 'mh' }, { name: 'Low mood', cat: 'mh' },
{ name: 'Sleep problems', cat: 'mh' }, { name: 'Snoring', cat: 'mh' },
{ name: 'Stress', cat: 'mh' },
// Joints & Muscles
{ name: 'Ankle pain', cat: 'joints' }, { name: 'Back pain', cat: 'joints' },
{ name: 'Elbow pain', cat: 'joints' }, { name: 'Foot pain', cat: 'joints' },
{ name: 'Hand pain', cat: 'joints' }, { name: 'Knee pain', cat: 'joints' },
{ name: 'Neck pain', cat: 'joints' }, { name: 'Shoulder pain', cat: 'joints' },
// Gut Health
{ name: 'Bloating', cat: 'gut' }, { name: 'Constipation', cat: 'gut' },
{ name: 'Diarrhoea', cat: 'gut' }, { name: 'Heartburn', cat: 'gut' },
{ name: 'Indigestion', cat: 'gut' }, { name: 'Stomach pain', cat: 'gut' },
// Women's Health
{ name: 'Breast Symptoms', cat: 'wh' }, { name: 'Menopause', cat: 'wh' },
{ name: 'Periods', cat: 'wh' }, { name: 'PMS', cat: 'wh' },
{ name: 'Vaginal symptoms', cat: 'wh' },
// Respiratory Health
{ name: 'Asthma', cat: 'resp' }, { name: 'Cold & Flu', cat: 'resp' },
{ name: 'Cough', cat: 'resp' }, { name: 'Covid-19', cat: 'resp' },
{ name: 'Shortness of breath', cat: 'resp' },
// Heart Health
{ name: 'Chest pain', cat: 'heart' }, { name: 'Heart Palpitations', cat: 'heart' },
{ name: 'Heart Symptoms', cat: 'heart' }, { name: 'High blood pressure', cat: 'heart' },
// Headaches & Dizziness
{ name: 'Dizziness', cat: 'headache' }, { name: 'Headache', cat: 'headache' },
{ name: 'Migraine', cat: 'headache' },
// Eyes, Ears, Nose & Throat
{ name: 'Ear Symptoms', cat: 'ent' }, { name: 'Eye Symptoms', cat: 'ent' },
{ name: 'Sinusitis', cat: 'ent' }, { name: 'Sore throat', cat: 'ent' },
// Minor illnesses
{ name: 'Fatigue', cat: 'ill' }, { name: 'Fever', cat: 'ill' },
{ name: 'Flu', cat: 'ill' }, { name: 'Hayfever', cat: 'ill' },
{ name: 'Tiredness', cat: 'ill' },
// Men's Health
{ name: 'Erection issues', cat: 'mens' }, { name: 'Genital Symptoms', cat: 'mens' },
{ name: 'Prostate symptoms', cat: 'mens' }, { name: 'Testicular symptoms', cat: 'mens' },
{ name: 'UTI', cat: 'mens' },
// Health Check Follow-Up
{ name: 'Follow-up appointment', cat: 'followup' },
{ name: 'Health check review', cat: 'followup' },
{ name: 'Test results review', cat: 'followup' }];

const CONCERNS_BY_CAT = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = CONCERNS.filter((c) => c.cat === cat.id).map((c) => c.name).sort();
  return acc;
}, {});

// Standard Levenshtein distance for fuzzy "did you mean?" matching.
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

// Returns the closest CONCERNS entry to q. Combines edit distance with a
// substring bonus so partial typed names (e.g. "ecz") still rank well.
// Returns null if the best score is too far off (threshold 5).
function findClosestConcern(q, concerns) {
  const ql = q.trim().toLowerCase();
  if (!ql) return null;
  let best = null;
  let bestScore = Infinity;
  for (const c of concerns) {
    const name = c.name.toLowerCase();
    let score = levenshtein(ql, name);
    if (name.includes(ql)) score -= 3;
    if (name.startsWith(ql)) score -= 1;
    if (score < bestScore) {bestScore = score;best = c;}
  }
  return bestScore < 5 ? best : null;
}

// Heuristic: very short, all-one-character, or no-vowels short input is gibberish
// — show the friendly fallback instead of guessing a "did you mean".
function looksLikeGibberish(q) {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return true;
  if (/^(.)\1+$/.test(s)) return true;
  if (s.length < 5 && !/[aeiouy]/.test(s)) return true;
  return false;
}

// ───────────────────────────────────────────────────────────────
// Health-concern icons — sprite from assets/concern-icons.png
// 12 cells, 144×144 each. Mapped to category ids in order.
// ───────────────────────────────────────────────────────────────
const HC_BLUE = 'var(--dca-primary)';
const ICON_ORDER = ['skin', 'joints', 'headache', 'wh', 'mh', 'ill', 'gut', 'ent', 'resp', 'mens', 'heart', 'followup'];
function HealthIcon({ id, size = 32 }) {
  const idx = ICON_ORDER.indexOf(id);
  if (idx < 0) {
    return (
      <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="9" stroke={HC_BLUE} strokeWidth="1.6" />
          <path d="M16 12v5M16 20v.1" stroke={HC_BLUE} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>);
  }
  return (
    <div
      role="img"
      style={{
        width: size, height: size, flexShrink: 0,
        backgroundImage: "url('assets/concern-icons.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${size * 12}px ${size}px`,
        backgroundPosition: `${-idx * size}px 0`
      }} />);
}

function SearchScreen({ go, setState, onClose, mergeSearch }) {
  const [q, setQ] = React.useState('');
  // Unified selection: { name, cat } — may come from common pills, accordion radios, or search results
  const [selected, setSelected] = React.useState(null);
  // Which All-concerns category is currently expanded (single open at a time)
  const [expandedCat, setExpandedCat] = React.useState(null);
  const ql = q.trim().toLowerCase();
  const isSearching = ql.length > 0;

  const matchedCats = isSearching ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(ql) || c.sub.toLowerCase().includes(ql)) : [];
  const matchedConcerns = isSearching ? CONCERNS.filter((c) => c.name.toLowerCase().includes(ql)).sort((a, b) => a.name.localeCompare(b.name)) : [];
  const noMatches = isSearching && matchedCats.length === 0 && matchedConcerns.length === 0;
  const suggestion = noMatches && !looksLikeGibberish(q) ? findClosestConcern(q, CONCERNS) : null;

  const choose = (cat, concern) => {
    setState((s) => ({ ...s, category: cat?.name || s.category, concern: concern?.name || concern || null }));
    if (concern) go('attach');else
    {setState((s) => ({ ...s, category: cat.name }));go('concern');}
  };
  const chooseConcernInCat = (cat, concernName) => {
    setState((s) => ({ ...s, category: cat.name, concern: concernName }));
    go('attach');
  };

  // Continue button is always solid blue (per spec). Tapping with no concern
  // chosen surfaces a transient toast near the top instead of silently doing
  // nothing.
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const onContinue = () => {
    if (!selected) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast('Please select a concern to continue.');
      toastTimer.current = setTimeout(() => setToast(null), 3000);
      return;
    }
    const cat = CATEGORIES.find((c) => c.id === selected.cat);
    setState((s) => ({ ...s, category: cat?.name || s.category, concern: selected.name }));
    go('attach');
  };

  const COMMON = [
    { name: 'Rash and skin irritation', cat: 'skin' },
    { name: 'Stomach pain', cat: 'gut' },
    { name: 'Moles & Skin Lesions', cat: 'skin' }];

  // All concern categories — Health Check Follow-Up is included so patients
  // returning for review can pick it without going through symptom search.
  const LIST_CATS = CATEGORIES;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(192.04deg, ${EMERG_BLUE_50} 0%, #FFFFFF 50%, ${EMERG_BLUE_50} 100%)`,
      position: 'relative'
    }}>
      <BookingHeader go={go} onClose={onClose} />

      {/* Validation toast — pinned above the sticky Continue button so the
          button doesn't obscure it. */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          display: 'inline-flex', alignItems: 'center', padding: '8px 16px',
          background: '#030712', borderRadius: 9999, zIndex: 50,
          boxShadow: '0 12px 24px rgba(0,0,0,0.24)', whiteSpace: 'nowrap',
          fontFamily: "'Work Sans'", fontWeight: 500, fontSize: 12, lineHeight: '16px',
          color: '#FFFFFF', animation: 'dcaToastUp 200ms ease-out'
        }}>{toast}</div>
      )}
      <style>{`@keyframes dcaToastUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>

      {/* Scroll + sticky footer wrapper */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x)', display: 'flex', flexDirection: 'column', gap: 'var(--dca-shell-gap)' }}>

          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div style={{
              fontFamily: "'Work Sans'", fontSize: 11, lineHeight: '14px',
              display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%'
            }}>
              <span style={{ color: '#030712', fontWeight: 600 }}>Booking details</span>
              <span style={{ color: '#4B5563', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Test Demo User</span>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 6, background: 'rgba(10,10,10,0.1)', borderRadius: 6 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '25%',
                background: 'linear-gradient(90deg, #133595 0%, #135CFF 100%)',
                borderRadius: 6
              }} />
            </div>
          </div>

          {/* Heading + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
            <div style={{
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px',
              color: '#030712'
            }}>How can we help you today?</div>
            <div style={{
              fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
              color: '#4B5563'
            }}>
              Please choose the main concern for your appointment. If unsure, just pick the closest match. Your clinician will be able to help with other relevant concerns.
            </div>
          </div>

          {/* Search combobox with floating label */}
          <div style={{ position: 'relative', width: '100%', marginTop: 4 }}>
            <div style={{
              position: 'absolute', left: 12, top: -8, zIndex: 2,
              padding: '0 4px', display: 'flex', alignItems: 'center', gap: 0,
              background: '#FFFFFF'
            }}>
              <span style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                color: 'var(--dca-primary-ink)'
              }}>Search by concern or symptom</span>
              <span style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                color: '#991B1B', marginLeft: 2
              }}>*</span>
            </div>
            <div style={{
              boxSizing: 'border-box',
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              gap: 4, padding: '6px 16px',
              width: '100%', height: 44,
              background: 'var(--dca-card-bg)',
              border: 'var(--dca-card-border-w) solid var(--dca-tint-border)',
              boxShadow: 'var(--dca-card-shadow)',
              borderRadius: 8
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7.333" cy="7.333" r="4.667" stroke="#4B5563" strokeWidth="1.333" />
                <path d="M13.333 13.333L10.667 10.667" stroke="#4B5563" strokeWidth="1.333" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); if (selected) setSelected(null); }}
                placeholder="e.g. cough, back pain, anxiety"
                style={{
                  flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit',
                  fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                  color: '#030712', minWidth: 0
                }} />
              {q &&
              <button onClick={() => setQ('')} style={{ all: 'unset', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M14 2L2 14" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              }
            </div>
          </div>

          {!isSearching && <>
            {/* Common concerns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                color: '#4B5563'
              }}>Common concerns</div>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {COMMON.map((c) => {
                  const isSel = selected?.name === c.name && selected?.cat === c.cat;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelected(isSel ? null : c)}
                      style={{
                        all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        gap: 8, padding: '10px 12px', height: 32,
                        background: isSel ? 'var(--dca-tint)' : '#FFFFFF',
                        border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`,
                        borderRadius: 9999
                      }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 9999,
                        border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`,
                        background: 'var(--dca-card-bg)',
                        boxShadow: 'var(--dca-card-shadow)',
                        display: 'grid', placeItems: 'center', flexShrink: 0
                      }}>
                        {isSel && <span style={{ width: 7, height: 7, borderRadius: 9999, background: 'var(--dca-primary)' }} />}
                      </span>
                      <span style={{
                        fontFamily: "'Work Sans'", fontWeight: isSel ? 600 : 400, fontSize: 12, lineHeight: '16px',
                        color: '#030712'
                      }}>{c.name}</span>
                    </button>);
                })}
              </div>
            </div>

            {/* Separator */}
            <div style={{ width: '100%', borderTop: 'var(--dca-card-border-w) solid var(--dca-tint-line)' }} />

            {/* All concerns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                color: '#4B5563', marginBottom: 4
              }}>All concerns</div>
              {LIST_CATS.map((cat, i) => {
                const isOpen = expandedCat === cat.id;
                const concernsInCat = CONCERNS_BY_CAT[cat.id] || [];
                return (
                  <React.Fragment key={cat.id}>
                    {i > 0 && <div style={{ width: '100%', borderTop: 'var(--dca-card-border-w) solid var(--dca-tint-line)' }} />}
                    <div style={{
                      display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8,
                      padding: '8px 0'
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9999,
                        display: 'grid', placeItems: 'center', flexShrink: 0
                      }}>
                        <HealthIcon id={cat.id} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
                          rowGap: 4, columnGap: 8
                        }}>
                          <div style={{ flex: 1, minWidth: 128, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{
                              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                              color: '#030712'
                            }}>{cat.name}</div>
                            <div style={{
                              fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                              color: '#4B5563'
                            }}>{cat.sub}</div>
                          </div>
                          <button
                            onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                            aria-expanded={isOpen}
                            style={{
                              all: 'unset', cursor: 'pointer',
                              display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
                              borderRadius: 9999
                            }}>
                            <span style={{
                              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
                              color: 'var(--dca-primary)'
                            }}>View concerns</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                              style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                              <path d="M4 6l4 4 4-4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isOpen &&
                    <div style={{
                      background: 'var(--dca-tint)', borderRadius: 16,
                      padding: 16, margin: '4px 0 8px',
                      display: 'flex', flexDirection: 'column'
                    }}>
                        {concernsInCat.map((name, idx) => {
                        const isSel = selected?.name === name && selected?.cat === cat.id;
                        return (
                          <React.Fragment key={name}>
                              {idx > 0 && <div style={{ width: '100%', borderTop: 'var(--dca-card-border-w) solid var(--dca-tint-line)', margin: '12px 0' }} />}
                              <button
                              onClick={() => setSelected(isSel ? null : { name, cat: cat.id })}
                              style={{
                                all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                                display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
                                gap: 8, width: '100%'
                              }}>
                                <span style={{
                                width: 16, height: 16, borderRadius: 9999, flexShrink: 0,
                                border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`,
                                background: 'var(--dca-card-bg)',
                                boxShadow: 'var(--dca-card-shadow)',
                                display: 'grid', placeItems: 'center', marginTop: 2
                              }}>
                                  {isSel && <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--dca-primary)' }} />}
                                </span>
                                <span style={{
                                fontFamily: "'Work Sans'", fontWeight: isSel ? 600 : 400,
                                fontSize: 12, lineHeight: '20px', color: '#030712'
                              }}>{name}</span>
                              </button>
                            </React.Fragment>);
                      })}
                      </div>
                  }
                  </React.Fragment>);
              })}
            </div>
          </>}

          {/* Search results — only shown while typing */}
          {isSearching && <>
            {matchedConcerns.length > 0 &&
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>Concerns</div>
                {matchedConcerns.slice(0, 12).map((c) => {
                const cat = CATEGORIES.find((x) => x.id === c.cat);
                const isSel = selected?.name === c.name && selected?.cat === c.cat;
                return (
                  <button key={c.name} onClick={() => setSelected(isSel ? null : { name: c.name, cat: c.cat })} style={{
                    all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                    background: isSel ? 'var(--dca-tint)' : '#fff',
                    border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`, borderRadius: 8,
                    boxShadow: 'var(--dca-card-shadow)'
                  }}>
                      <div style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <HealthIcon id={c.cat} size={24} />
                      </div>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <Highlight text={c.name} q={ql} bold />
                        <div style={{ fontSize: 11, color: '#4B5563', marginTop: 1 }}>in {cat?.name}</div>
                      </div>
                      <span style={{
                        width: 16, height: 16, borderRadius: 9999, flexShrink: 0,
                        border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`, background: '#fff',
                        display: 'grid', placeItems: 'center'
                      }}>
                        {isSel && <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--dca-primary)' }} />}
                      </span>
                    </button>);
              })}
              </div>
            }
            {noMatches && suggestion &&
            <div style={{ padding: '20px 18px', background: EMERG_BLUE_50, border: 'var(--dca-card-border-w) solid var(--dca-tint-border)', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 4 }}>No exact match for "{q}"</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#030712', marginBottom: 12 }}>Did you mean <span style={{ color: 'var(--dca-primary)' }}>{suggestion.name}</span>?</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => choose(CATEGORIES.find((x) => x.id === suggestion.cat), suggestion)} style={{
                  all: 'unset', cursor: 'pointer', padding: '8px 14px', borderRadius: 9999,
                  background: 'var(--dca-primary)', color: 'var(--dca-tint)', fontWeight: 600, fontSize: 12
                }}>Yes, use {suggestion.name}</button>
                  <button onClick={() => setQ('')} style={{
                  all: 'unset', cursor: 'pointer', padding: '8px 14px', borderRadius: 9999,
                  background: '#fff', color: '#030712', fontWeight: 600, fontSize: 12, border: 'var(--dca-card-border-w) solid var(--dca-tint-border)'
                }}>Clear search</button>
                </div>
              </div>
            }
            {noMatches && !suggestion &&
            <div style={{ padding: '20px 18px', textAlign: 'center', background: '#fff', border: '1px dashed var(--dca-tint-border)', borderRadius: 10 }}>
                <div style={{ fontWeight: 600, color: '#030712', marginBottom: 6, fontSize: 13 }}>We couldn't find "{q}"</div>
                <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 12, lineHeight: 1.4 }}>Try a different keyword, or browse all concerns below.</div>
                <button onClick={() => setQ('')} style={{
                all: 'unset', cursor: 'pointer', padding: '8px 14px', borderRadius: 9999,
                background: 'var(--dca-primary)', color: 'var(--dca-tint)', fontWeight: 600, fontSize: 12
              }}>Clear search</button>
              </div>
            }
          </>}
        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'sticky', bottom: 0,
          padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x) 28px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          flexShrink: 0
        }}>
          <button
            onClick={onContinue}
            style={{
              all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 8, padding: '12px 16px', width: '100%', height: 40,
              background: 'var(--dca-primary)',
              boxShadow: '0px 4px 6px -1px rgba(15,55,190,0.05), 0px 2px 4px -2px rgba(15,55,190,0.05)',
              borderRadius: 9999,
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
              color: 'var(--dca-tint)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
            {selected ? `Continue with ${selected.name}` : 'Continue'}
          </button>
        </div>
      </div>
    </div>);
}

function CategoryCard({ cat, expanded, onToggle, onConcern }) {
  const img = CATEGORY_IMAGES[cat.id];
  const concerns = CONCERNS_BY_CAT[cat.id] || [];
  return (
    <div style={{
      background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(6,23,49,0.04)'
    }}>
      <button onClick={onToggle} style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
        alignItems: 'stretch', width: '100%', minHeight: 64
      }}>
        {img ? <img src={img} alt="" style={{ width: 64, alignSelf: 'stretch', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 64, background: BLUE_100, flexShrink: 0 }} />}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', textAlign: 'left', minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5, marginBottom: 2 }}>{cat.name}</div>
            <div style={{ fontSize: 11.5, color: GREY_TEXT, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{cat.sub}</div>
          </div>
          <svg width="10" height="6" viewBox="0 0 9 6" fill="none" style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path d="M1 1l3.5 3.5L8 1" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </button>
      {expanded && concerns.length > 0 &&
      <div style={{ borderTop: `1px solid ${GREY_BORDER}`, padding: '4px 0', background: '#FAFBFC' }}>
          {concerns.map((name) =>
        <button key={name} onClick={() => onConcern(name)} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', gap: 8, padding: '11px 14px 11px 76px', width: '100%',
          borderBottom: `1px solid ${GREY_BORDER}`
        }}>
              <span style={{ flex: 1, fontSize: 13.5, color: NAVY, fontWeight: 500 }}>{name}</span>
              <Chevron />
            </button>
        )}
        </div>
      }
    </div>);
}

function Highlight({ text, q, bold }) {
  if (!q) return <span style={{ fontWeight: bold ? 600 : 400, color: NAVY, fontSize: 14 }}>{text}</span>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <span style={{ fontWeight: bold ? 600 : 400, color: NAVY, fontSize: 14 }}>{text}</span>;
  return (
    <span style={{ color: NAVY, fontSize: 14, fontWeight: bold ? 600 : 400 }}>
      {text.slice(0, i)}<mark style={{ background: '#FFF3B8', color: NAVY, padding: 0 }}>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}
    </span>);
}

// ═════════════════════════════════════════════════════════════
// 05 — Concern (when chosen by category)
// ═════════════════════════════════════════════════════════════
function ConcernScreen({ go, state, setState, onClose }) {
  const cat = CATEGORIES.find((c) => c.name === state.category);
  const list = cat ? CONCERNS.filter((c) => c.cat === cat.id) : CONCERNS;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose} />
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 24px' }}>
        <div style={{ fontSize: 12, color: GREY_TEXT, marginBottom: 4 }}>{state.category}</div>
        <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select a health concern</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((c) =>
          <button key={c.name} onClick={() => {setState((s) => ({ ...s, concern: c.name }));go('attach');}} style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
            alignItems: 'center', gap: 12, width: '100%',
            background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
            padding: '14px', boxShadow: '0 1px 2px rgba(6,23,49,0.04)'
          }}>
              <div style={{ flex: 1, textAlign: 'left', fontWeight: 600, color: NAVY, fontSize: 14.5 }}>{c.name}</div>
              <Chevron />
            </button>
          )}
        </div>
      </div>
    </div>);
}

// ═════════════════════════════════════════════════════════════
// 06 — Attach file
// ═════════════════════════════════════════════════════════════
function BookingShell({ go, onClose, progress, breadcrumb, children, footer }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(192.04deg, ${EMERG_BLUE_50} 0%, #FFFFFF 50%, ${EMERG_BLUE_50} 100%)`
    }}>
      <BookingHeader go={go} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1,
          padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x)',
          display: 'flex', flexDirection: 'column', gap: 'var(--dca-shell-gap)'
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div style={{
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
              color: '#4B5563', display: 'flex', alignItems: 'center', minWidth: 0, width: '100%'
            }}>{breadcrumb}</div>
            <div style={{ position: 'relative', width: '100%', height: 6, background: 'rgba(10,10,10,0.1)', borderRadius: 6 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--dca-primary-deep) 0%, var(--dca-primary) 100%)',
                borderRadius: 6, transition: 'width 200ms ease'
              }} />
            </div>
          </div>
          {children}
        </div>
        <div style={{
          position: 'sticky', bottom: 0,
          padding: 'var(--dca-shell-padding-y) var(--dca-shell-padding-x) 28px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          flexShrink: 0
        }}>{footer}</div>
      </div>
    </div>);
}

function PillCTA({ children, onClick, disabled, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        all: 'unset', boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 8, padding: '12px 16px', width: '100%', height: 40,
        background: disabled ? 'var(--dca-tint-border)' : (isPrimary ? 'var(--dca-primary)' : '#FFFFFF'),
        border: isPrimary ? 'none' : 'var(--dca-card-border-w) solid var(--dca-tint-border)',
        boxShadow: disabled ? 'none' : '0px 4px 6px -1px rgba(15,55,190,0.05), 0px 2px 4px -2px rgba(15,55,190,0.05)',
        borderRadius: 9999,
        fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
        color: isPrimary ? 'var(--dca-tint)' : 'var(--dca-primary)', opacity: disabled ? 0.7 : 1,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
      {children}
    </button>);
}

function AttachScreen({ go, state, onClose }) {
  const [file, setFile] = React.useState(null);
  const inputRef = React.useRef(null);
  const concern = state?.concern || 'your concern';
  const memberName = (state?.member || 'Test Demo User').split(' ')[0] || 'You';

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile({ name: f.name, size: f.size });
  };
  const removeFile = () => { setFile(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <BookingShell
      go={go} onClose={onClose}
      progress={50}
      breadcrumb={
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0, width: '100%' }}>
          <span style={{ color: '#030712', fontWeight: 600 }}>Booking details</span>
          <span style={{ color: '#4B5563', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(state?.member || 'Test Demo User')}{state?.concern ? ' · ' + state.concern : ''}</span>
        </span>
      }
      footer={<PillCTA onClick={() => go('clinician-type')}>{file ? 'Continue' : 'Skip for now'}</PillCTA>}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>
          Anything you'd like to share?
        </div>
        <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
          A high-quality photo or document related to {concern.toLowerCase()} helps your clinician understand your symptoms before the appointment. This is optional.
        </div>
      </div>

      {/* Upload dropzone */}
      {!file &&
      <button
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer', width: '100%',
          background: 'var(--dca-card-bg)',
          border: '1.5px dashed var(--dca-tint-border)', borderRadius: 12,
          padding: '24px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          boxShadow: 'var(--dca-card-shadow)'
        }}>
          <div style={{
          width: 40, height: 40, borderRadius: 9999, background: 'var(--dca-tint)',
          display: 'grid', placeItems: 'center'
        }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4M6 10l6-6 6 6" stroke="var(--dca-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 18v1a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="var(--dca-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: 'var(--dca-primary)' }}>
            Upload a file
          </div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 11, lineHeight: '14px', color: '#4B5563', textAlign: 'center' }}>
            JPG, PNG or PDF · up to 10 MB
          </div>
        </button>
      }
      {file &&
      <div style={{
        width: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--dca-card-bg)', border: 'var(--dca-card-border-w) solid var(--dca-tint-border)', borderRadius: 10,
        padding: 12, boxShadow: 'var(--dca-card-shadow)'
      }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--dca-tint)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="var(--dca-primary)" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M14 3v5h5" stroke="var(--dca-primary)" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#030712', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
            <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 11, lineHeight: '14px', color: '#4B5563' }}>{Math.max(1, Math.round(file.size / 1024))} KB · uploaded</div>
          </div>
          <button onClick={removeFile} style={{ all: 'unset', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      }
      <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={onPick} />

      {/* Privacy note */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M8 1.5L2 4v4.5c0 3.5 2.5 6 6 6.5 3.5-.5 6-3 6-6.5V4L8 1.5z" stroke="#030712" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5.5 8l2 2 3-3.5" stroke="#030712" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 11, lineHeight: '14px', color: '#4B5563' }}>
          Uploads are private to your medical record and only seen by your clinician.
        </div>
      </div>
    </BookingShell>);
}

// ═════════════════════════════════════════════════════════════
// 07 — Select clinician type
// ═════════════════════════════════════════════════════════════
const CLINICIAN_TYPE_OPTIONS = [
  {
    id: 'ACP',
    title: 'Advanced Clinician',
    summary: 'Everyday issues, prescriptions, fit notes, and more.',
    intro: 'Highly experienced clinicians registered with the Nursing and Midwifery Council (NMC) or the Health and Care Professions Council (HCPC).',
    can: [
      "Diagnose and treat most everyday health concerns, including the one you've just selected",
      'Prescribe medication',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support']
  },
  {
    id: 'Doctors',
    title: 'GP (Doctor)',
    summary: 'Complex conditions, prescriptions, referrals, and more.',
    intro: 'Fully qualified, General Medical Council (GMC) registered doctors. Useful when you want a doctor specifically, or when an ACP refers you on.',
    can: [
      'Diagnose and treat complex medical conditions',
      'Prescribe medication',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support']
  },
  {
    id: 'Mental health practitioners',
    title: 'Mental Health Practitioner',
    summary: 'Mental health assessment, anxiety, stress, low mood, sleep.',
    intro: 'A first-line mental health professional registered with the Nursing and Midwifery Council (NMC). They can assess your needs and refer you on for therapy or psychiatric care.',
    can: [
      'Carry out initial mental health assessment',
      'Support anxiety, stress, low mood, sleep issues',
      'Issue referrals and fit notes',
      'Provide a treatment plan and onward referral']
  },
  {
    id: 'Physiotherapists',
    title: 'Physiotherapist',
    summary: 'Muscle, joint and movement issues — exercise plans and recovery.',
    intro: 'Physiotherapists assess muscle, joint, and movement-related concerns. They can give you a tailored exercise programme and refer you on if imaging or specialist care is needed.',
    can: [
      'Assess muscle, joint and movement-related concerns',
      'Build a tailored exercise programme',
      'Refer for imaging or specialist care',
      'Provide ongoing recovery support']
  }];

// Map category id → recommended clinician-type id.
// Heart Health routes to a GP; every other concern defaults to ACP
// (Advanced Clinician) — see getRecommendedType fallback below.
const RECOMMEND_BY_CAT = {
  heart: 'Doctors',
};

function getRecommendedType(state) {
  const cat = CATEGORIES.find((c) => c.name === state?.category);
  return (cat && RECOMMEND_BY_CAT[cat.id]) || 'ACP';
}

function ClinicianTypeScreen({ go, state, setState, onClose }) {
  const recommendedId = getRecommendedType(state);
  const [selected, setSelected] = React.useState(recommendedId);
  // Per-card "What they do" toggle — recommended is open by default.
  const [openCard, setOpenCard] = React.useState({ [recommendedId]: true });
  // "Other clinician types" disclosure — false by default per spec.
  const [showOthers, setShowOthers] = React.useState(false);

  const concern = state?.concern || 'your concern';
  const recommendedMeta = CLINICIAN_TYPE_OPTIONS.find((o) => o.id === recommendedId);
  const others = CLINICIAN_TYPE_OPTIONS.filter((o) => o.id !== recommendedId);
  const article = /^[aeiou]/i.test(recommendedMeta?.title || '') ? 'an' : 'a';
  const selectedMeta = CLINICIAN_TYPE_OPTIONS.find((o) => o.id === selected);

  const onContinue = () => {
    setState((s) => ({ ...s, clinicianType: selected }));
    go('time-of-day');
  };

  return (
    <BookingShell
      go={go} onClose={onClose}
      progress={75}
      breadcrumb={
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0, width: '100%' }}>
          <span style={{ color: '#030712', fontWeight: 600 }}>Booking details</span>
          <span style={{ color: '#4B5563', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(state?.member || 'Test Demo User')}{state?.concern ? ' · ' + state.concern : ''}</span>
        </span>
      }
      footer={<PillCTA onClick={onContinue}>{`Continue with ${selectedMeta?.title || 'this clinician'}`}</PillCTA>}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>
          How can we help?
        </div>
        <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
          For <strong style={{ color: '#030712', fontWeight: 600 }}>{concern}</strong>, we recommend booking an appointment with {article} <strong style={{ color: '#030712', fontWeight: 600 }}>{recommendedMeta?.title}</strong> — they're also likely to be available sooner.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', paddingTop: 8 }}>
        {/* Recommended card */}
        <ClinicianTypeCard
          meta={recommendedMeta}
          recommended
          selected={selected === recommendedMeta.id}
          expanded={!!openCard[recommendedMeta.id]}
          onSelect={() => setSelected(recommendedMeta.id)}
          onToggle={() => setOpenCard((e) => ({ ...e, [recommendedMeta.id]: !e[recommendedMeta.id] }))} />

        {/* Other clinician types disclosure */}
        <button
          onClick={() => setShowOthers((v) => !v)}
          aria-expanded={showOthers}
          style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: 'var(--dca-primary)'
          }}>
          Other clinician types
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showOthers ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
            <path d="M4 6l4 4 4-4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showOthers &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {others.map((meta) =>
          <ClinicianTypeCard
            key={meta.id}
            meta={meta}
            selected={selected === meta.id}
            expanded={!!openCard[meta.id]}
            onSelect={() => setSelected(meta.id)}
            onToggle={() => setOpenCard((e) => ({ ...e, [meta.id]: !e[meta.id] }))} />
          )}
          </div>
        }
      </div>
    </BookingShell>);
}

function ClinicianTypeCard({ meta, recommended, selected, expanded, onSelect, onToggle }) {
  return (
    <div data-dca-card style={{
      position: 'relative',
      boxSizing: 'border-box', width: '100%',
      background: selected ? 'var(--dca-tint)' : 'var(--dca-card-bg)',
      border: `${selected ? 2 : 1}px solid ${selected ? 'var(--dca-primary)' : 'var(--dca-tint-line)'}`,
      boxShadow: selected ? 'var(--dca-card-shadow-strong)' : 'var(--dca-card-shadow)',
      borderRadius: 16,
      padding: 24, marginTop: recommended ? 10 : 0
    }}>
      {recommended &&
      <div style={{
        position: 'absolute', left: 16, top: -10,
        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4,
        padding: '2px 8px', height: 18,
        background: 'var(--dca-primary)', borderRadius: 9999
      }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1l1.2 3.2L10.5 5l-2.8 1.6L6 10 4.3 6.6 1.5 5l3.3-.8L6 1z" stroke="var(--dca-tint)" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
          <span style={{
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
          color: 'var(--dca-tint)'
        }}>Recommended</span>
        </div>
      }

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 14, lineHeight: '20px',
            color: 'var(--dca-primary)'
          }}>{meta.title}</div>

          {/* "Can do" summary row */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M3.5 8.5l3 3 6-6.5" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{
              flex: 1,
              fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
              color: '#030712'
            }}>{meta.summary}</div>
          </div>

          {/* "What they do" toggle */}
          <button
            onClick={onToggle}
            aria-expanded={expanded}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
              color: 'var(--dca-primary)'
            }}>
            See what they do
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
              <path d="M4 6l4 4 4-4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Expanded detail */}
        {expanded &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meta.intro &&
          <div style={{
            fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
            color: '#030712'
          }}>{meta.intro}</div>
          }
            <div style={{
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: '#030712'
          }}>They can:</div>
            <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {meta.can.map((line) =>
            <li key={line} style={{
              fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
              color: '#030712'
            }}>{line}</li>
            )}
            </ul>
          </div>
        }

        {/* Select / Selected button */}
        <button
          onClick={onSelect}
          style={{
            all: 'unset', boxSizing: 'border-box', cursor: 'pointer', alignSelf: 'flex-start',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 8, padding: '12px 16px', height: 40, minWidth: 108,
            background: selected ? 'var(--dca-primary)' : '#FFFFFF',
            border: selected ? 'none' : '1px solid #FFB306',
            boxShadow: 'var(--dca-card-shadow)',
            borderRadius: 9999,
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: selected ? 'var(--dca-tint)' : '#030712'
          }}>
          <span>{selected ? 'Selected' : 'Select'}</span>
          {selected &&
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1.5 8.5l3 3 6-6.5M6.5 11.5l3 3 6-6.5" stroke="var(--dca-tint)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        </button>
      </div>
    </div>);
}

// ═════════════════════════════════════════════════════════════
// 08 — When would you like your appointment? (time-of-day bands)
// ═════════════════════════════════════════════════════════════

// Prototype "now" — pinned so the UX is reproducible regardless of wall clock.
// Tue 19 May 2026, 17:00 (local).
// Single source of truth for "now". Computed once at module load — fine for
// a short demo session; render-time freshness isn't needed.
const BOOKING_NOW = new Date();
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Slot grid is fixed to 15-minute boundaries (:00 / :15 / :30 / :45).
const QUARTER_HOUR_MS = 15 * 60 * 1000;
function roundUpToQuarterHour(d) {
  // Ceil to the next :15 boundary. If d is already exactly on one (ms === 0),
  // returns d unchanged — no spurious bump.
  return new Date(Math.ceil(d.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS);
}

// Earliest bookable slot = now + 1hr lead, rounded up to the next :15 boundary.
// Example: now 17:54 → +1hr = 18:54 → round up → 19:00.
function getEarliestSlot(now) {
  return roundUpToQuarterHour(new Date(now.getTime() + 60 * 60 * 1000));
}

function addDays(d, n) {
  const dd = new Date(d);
  dd.setDate(d.getDate() + n);
  return dd;
}

function dayDiff(a, b) {
  const a0 = new Date(a); a0.setHours(0, 0, 0, 0);
  const b0 = new Date(b); b0.setHours(0, 0, 0, 0);
  return Math.round((a0.getTime() - b0.getTime()) / 86400000);
}

const TIME_BANDS = [
  { id: 'morning',   label: 'Morning (7am – 12pm)',         start: 7,  end: 12 },
  { id: 'afternoon', label: 'Afternoon (12pm – 5pm)',       start: 12, end: 17 },
  { id: 'evening',   label: 'Evening (5pm – Midnight)',     start: 17, end: 24 },
  { id: 'overnight', label: 'Overnight (12am – 7am)',        start: 0,  end: 7  }];

// The actual Date a slot represents. Overnight slots roll into the NEXT day.
function slotDate(currentDay, band, h, m) {
  const base = band.id === 'overnight' ? addDays(currentDay, 1) : new Date(currentDay);
  base.setHours(h, m, 0, 0);
  return base;
}

// Deterministic per-day, per-band slot counts and concrete times. Slots are
// fixed to the 15-min grid. When `nowDate` is passed, only slots at or after
// getEarliestSlot(nowDate) survive — i.e. the standard +1hr lead rounded up
// to the next :15. Pseudo-noise mirrors real-world "some slots taken".
function timesForBand(currentDay, band, nowDate) {
  const seed = currentDay.getDate() + band.start * 7;
  const earliestMs = nowDate ? getEarliestSlot(nowDate).getTime() : 0;
  const out = [];
  for (let h = band.start; h < band.end; h++) {
    for (let m = 0; m < 60; m += 15) {
      const noise = (seed * 31 + h * 7 + m) % 10;
      if (noise < 3) continue;
      if (nowDate && slotDate(currentDay, band, h, m).getTime() < earliestMs) continue;
      out.push({ h, m });
    }
  }
  return out;
}

function fmtTime(h, m) {
  // 24-hour HH:MM — matches the booking-flow spec.
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDateTab(date) {
  return `${DAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

// Relative-aware label for a date pill in the 14-day rolling window.
// idx is the pill's position (0 = today, 1 = tomorrow, else day + date).
function fmtDayPillLabel(date, idx) {
  const day = DAYS_SHORT[date.getDay()];
  const dom = date.getDate();
  const mon = MONTHS_SHORT[date.getMonth()];
  if (idx === 0) return `Today · ${day} ${dom} ${mon}`;
  if (idx === 1) return `Tomorrow · ${day} ${dom} ${mon}`;
  return `${day}, ${dom} ${mon}`;
}

// Dynamic band heading that shows the cross-midnight date for the overnight
// band: "Tonight after midnight (12am – 7am Wed)" when today is selected, or
// "Overnight (12am – 7am Thu)" otherwise.
function getBandLabel(band, currentDay, dayIdx) {
  if (band.id === 'overnight') {
    const next = addDays(currentDay, 1);
    const nd = DAYS_SHORT[next.getDay()];
    if (dayIdx === 0) return `Tonight after midnight (12am – 7am ${nd})`;
    return `Overnight (12am – 7am ${nd})`;
  }
  return band.label;
}

// ─────────────────────────────────────────────────────────────
// Filter UI for the time-of-day screen — pill row + bottom sheets.
// Visual language: yellow #FFB306 stroke for actionable buttons,
// blue #135CFF + tint fill for selected state.
// ─────────────────────────────────────────────────────────────
const DCA_YELLOW = '#FFB306';

function PrefPill({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 12px', background: '#FFFFFF',
        border: `1px solid ${DCA_YELLOW}`, borderRadius: 9999,
        fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
        color: '#030712', whiteSpace: 'nowrap', maxWidth: 180,
        overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M4 6l4 4 4-4" stroke="#030712" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>);
}

function FilterSheetHost({ which, filters, setFilters, concern, onClose, onCommit }) {
  const titles = { gender: 'Clinician gender', type: 'Clinician type', apptKind: 'Appointment type' };
  // Preview state — tapping options updates this; we only commit when the
  // user dismisses the sheet (tap outside or via the auto-close timer).
  const initial = which === 'gender' ? filters.gender : which === 'apptKind' ? filters.apptKind : filters.type;
  const [preview, setPreview] = React.useState(initial);
  React.useEffect(() => { setPreview(initial); }, [initial]);

  const commit = React.useCallback(() => {
    onCommit && onCommit(which, preview);
    onClose();
  }, [which, preview, onCommit, onClose]);

  // The portal target (IOSDevice) sits OUTSIDE the [data-dca-theme] wrapper,
  // so we re-establish the theme here — otherwise every `var(--dca-primary)`
  // inside the sheet resolves to empty and selected states lose their colour.
  return (
    <div data-dca-theme="dca">
      <div
        onClick={commit}
        style={{
          position: 'absolute', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.4)',
          animation: 'dcaFilterFade 180ms ease-out'
        }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 301,
          background: '#FFFFFF',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: '12px 24px 28px',
          maxHeight: '88%', overflowY: 'auto',
          boxShadow: '0 -12px 36px rgba(6,23,49,0.18)',
          animation: 'dcaFilterSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          WebkitOverflowScrolling: 'touch',
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <div style={{ width: 80, height: 4, borderRadius: 999, background: 'rgba(3, 7, 18, 0.1)' }} />
        </div>
        <div style={{
          textAlign: 'center', fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px',
          color: '#030712'
        }}>{titles[which]}</div>
        {which === 'gender' &&
          <GenderSheet value={preview} onChange={setPreview} />}
        {which === 'apptKind' &&
          <ApptKindSheet value={preview} onChange={setPreview} />}
        {which === 'type' &&
          <ClinicianTypeSheet value={preview} concern={concern}
            onChange={(v) => { setPreview(v); }}
            onAutoClose={(v) => { onCommit && onCommit('type', v); onClose(); }} />}
      </div>
    </div>);
}

function SegmentedOptionButton({ selected, onClick, icon, label }) {
  // Border width is 2px in BOTH states — only the colour flips. Keeping the
  // width constant avoids the 1-2px layout jump that would occur if selecting
  // a card grew its border.
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none', WebkitAppearance: 'none',
        font: 'inherit', margin: 0,
        cursor: 'pointer', boxSizing: 'border-box', flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: 8, height: 56,
        background: '#FFFFFF',
        border: `2px solid ${selected ? 'var(--dca-primary)' : 'var(--dca-tint-line)'}`,
        borderRadius: 8,
        fontFamily: "'Work Sans'", fontWeight: selected ? 600 : 400, fontSize: 12, lineHeight: '16px',
        color: selected ? 'var(--dca-primary)' : '#030712'
      }}>
      <span style={{ color: selected ? 'var(--dca-primary)' : '#030712', display: 'inline-flex' }}>{icon}</span>
      <span>{label}</span>
    </button>);
}

function GenderSheet({ value, onChange }) {
  const Person = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c1.4-3.5 4-5 7-5s5.6 1.5 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>);
  const Venus = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13.5V21M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>);
  const Mars = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 10.5L20 4M15 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <SegmentedOptionButton selected={value === 'any'} onClick={() => onChange('any')} icon={Person} label="Any" />
      <SegmentedOptionButton selected={value === 'female'} onClick={() => onChange('female')} icon={Venus} label="Female" />
      <SegmentedOptionButton selected={value === 'male'} onClick={() => onChange('male')} icon={Mars} label="Male" />
    </div>);
}

function ApptKindSheet({ value, onChange }) {
  const Video = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 10l5-3v10l-5-3v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>);
  const Phone = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 4h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <SegmentedOptionButton selected={value === 'video'} onClick={() => onChange('video')} icon={Video} label="Video" />
      <SegmentedOptionButton selected={value === 'phone'} onClick={() => onChange('phone')} icon={Phone} label="Phone" />
    </div>);
}

function ClinicianTypeSheet({ value, concern, onChange, onAutoClose }) {
  const [showOthers, setShowOthers] = React.useState(value !== 'ACP');
  const [openCard, setOpenCard] = React.useState({ ACP: true });
  const timer = React.useRef(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Tap "Select" → preview the change immediately, then after 800ms auto-close
  // + commit. Tapping outside / dragging before then commits early.
  const select = (v) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (onAutoClose) onAutoClose(v); }, 800);
  };

  const recommended = CLINICIAN_TYPE_OPTIONS.find((o) => o.id === 'ACP');
  const others = CLINICIAN_TYPE_OPTIONS.filter((o) => o.id !== 'ACP');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
        color: '#4B5563'
      }}>
        For <strong style={{ color: '#030712', fontWeight: 600 }}>{concern || 'your concern'}</strong>, we recommend
        booking an appointment with an <strong style={{ color: '#030712', fontWeight: 600 }}>Advanced Clinician</strong> —
        they're also likely to have better availability.
      </div>
      <ClinicianTypeCard
        meta={recommended}
        recommended
        selected={value === recommended.id}
        expanded={!!openCard[recommended.id]}
        onSelect={() => select(recommended.id)}
        onToggle={() => setOpenCard((e) => ({ ...e, [recommended.id]: !e[recommended.id] }))} />
      <button
        onClick={() => setShowOthers((v) => !v)}
        aria-expanded={showOthers}
        style={{
          all: 'unset', cursor: 'pointer', alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
          color: 'var(--dca-primary)'
        }}>
        Other clinician types
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transform: showOthers ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
          <path d="M4 6l4 4 4-4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {showOthers &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {others.map((meta) =>
            <ClinicianTypeCard
              key={meta.id}
              meta={meta}
              selected={value === meta.id}
              expanded={!!openCard[meta.id]}
              onSelect={() => select(meta.id)}
              onToggle={() => setOpenCard((e) => ({ ...e, [meta.id]: !e[meta.id] }))} />
          )}
        </div>
      }
    </div>);
}

function TimeOfDayScreen({ go, state, setState, onClose }) {
  // 14-day rolling window starting today. "Today" is pinned to BOOKING_NOW so
  // the prototype shows a believable state (no past slots, etc.) regardless
  // of the actual wall clock.
  const NOW = BOOKING_NOW;
  const today = React.useMemo(() => { const d = new Date(NOW); d.setHours(0, 0, 0, 0); return d; }, []);
  const days = React.useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);

  // The default selected slot is the earliest bookable one (now + 1hr lead,
  // ceil'd to :15). If that crosses midnight, dayIdx advances accordingly.
  const earliestDefault = React.useMemo(() => {
    const earliest = getEarliestSlot(NOW);
    const dayOffset = dayDiff(earliest, today);
    const eh = earliest.getHours();
    const em = earliest.getMinutes();
    const band = TIME_BANDS.find((b) => {
      if (b.id === 'overnight') return eh < b.end;
      return eh >= b.start && eh < b.end;
    }) || TIME_BANDS[0];
    return { dayIdx: Math.max(dayOffset, 0), band: band.id, h: eh, m: em };
  }, [NOW, today]);

  const [dayIdx, setDayIdx] = React.useState(earliestDefault.dayIdx);
  const [winStart, setWinStart] = React.useState(0); // index of leftmost visible tab
  // All time-band accordions start collapsed — the user has to tap a band
  // to reveal its slot list. The default selectedSlot still drives the
  // Continue button label so the screen is actionable on first load.
  const [openBand, setOpenBand] = React.useState(null);
  const [selectedSlot, setSelectedSlot] = React.useState({
    band: earliestDefault.band, h: earliestDefault.h, m: earliestDefault.m,
  });

  // Filter sheet state. Defaults seed from the clinician-type screen.
  const [filters, setFilters] = React.useState(() => ({
    gender: 'any', // 'any' | 'female' | 'male'
    type: state?.clinicianType || 'ACP',
    apptKind: 'video' // 'video' | 'phone'
  }));
  const [activeSheet, setActiveSheet] = React.useState(null); // 'gender' | 'type' | 'apptKind' | null
  // Filter pills row is collapsible — the icon button on the right toggles it.
  const [showFilters, setShowFilters] = React.useState(true);
  // Continue button transitions through idle → loading → navigate when a slot
  // is selected. The loading state is non-interactive and shows a spinner.
  const [continueLoading, setContinueLoading] = React.useState(false);
  // Toast + slot-refresh state for filter changes.
  const [toast, setToast] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const toastTimer = React.useRef(null);
  const refreshTimer = React.useRef(null);
  React.useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);
  const screenRef = React.useRef(null);
  const [frameEl, setFrameEl] = React.useState(null);
  React.useEffect(() => {
    if (screenRef.current) {
      setFrameEl(screenRef.current.closest('[data-ios-frame="1"]') || document.body);
    }
  }, []);

  const member = (state?.member || 'Jane Doe');
  const concern = state?.concern || 'Your concern';
  const clinicianTypeId = state?.clinicianType || 'ACP';
  const clinicianMeta = CLINICIAN_TYPE_OPTIONS.find((o) => o.id === clinicianTypeId);
  const clinicianTitle = clinicianMeta?.title || 'Clinician';

  const visibleDays = days.slice(winStart, winStart + 2);
  const canPrev = winStart > 0;
  const canNext = winStart + 2 < days.length;
  const currentDay = days[dayIdx];

  // Hide bands whose slots are entirely in the past for "today". Other days
  // always show all four bands.
  const visibleBands = React.useMemo(() => {
    if (dayIdx !== 0) return TIME_BANDS;
    return TIME_BANDS.filter((b) => timesForBand(currentDay, b, NOW).length > 0);
  }, [dayIdx, currentDay, NOW]);

  // Soonest bookable slot across the whole window — drives the "Next available"
  // hero card.
  const nextAvailable = React.useMemo(() => {
    for (let di = 0; di < days.length; di++) {
      const d = days[di];
      for (const band of TIME_BANDS) {
        const slots = timesForBand(d, band, NOW);
        if (slots.length) {
          return { dayIdx: di, day: d, band, slot: slots[0] };
        }
      }
    }
    return null;
  }, [days, NOW]);

  // Continue button label: relative day prefix + 24h time + "(in N minutes)"
  // when the slot is within the next hour.
  const continueLabel = React.useMemo(() => {
    if (!selectedSlot) return 'Continue';
    const band = TIME_BANDS.find((b) => b.id === selectedSlot.band);
    const sd = slotDate(currentDay, band, selectedSlot.h, selectedSlot.m);
    const slotIdxFromToday = dayDiff(sd, today);
    let dayLabel;
    if (slotIdxFromToday === 0) dayLabel = 'today';
    else if (slotIdxFromToday === 1) dayLabel = 'tomorrow';
    else if (slotIdxFromToday > 1 && slotIdxFromToday <= 6) dayLabel = `in ${slotIdxFromToday} days`;
    else dayLabel = `${DAYS_SHORT[sd.getDay()]} ${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]}`;
    const timeLabel = fmtTime(selectedSlot.h, selectedSlot.m);
    const diffMin = Math.round((sd.getTime() - NOW.getTime()) / 60000);
    const suffix = diffMin > 0 && diffMin <= 60 ? ` (in ${diffMin} minutes)` : '';
    return `Continue with ${dayLabel}, ${timeLabel}${suffix}`;
  }, [selectedSlot, currentDay, today, NOW]);

  // Filter pill labels.
  const genderLabel = filters.gender === 'any' ? 'Any gender' :
    filters.gender === 'female' ? 'Female clinician' : 'Male clinician';
  const filterTypeMeta = CLINICIAN_TYPE_OPTIONS.find((o) => o.id === filters.type);
  const filterTypeLabel = filterTypeMeta?.title || 'Clinician type';
  const apptKindLabel = filters.apptKind === 'video' ? 'Video appointment' : 'Phone appointment';

  const labelFor = (which, v) => {
    if (which === 'gender') return v === 'any' ? 'Any gender' : v === 'female' ? 'Female clinician' : 'Male clinician';
    if (which === 'apptKind') return v === 'video' ? 'Video appointment' : 'Phone appointment';
    if (which === 'type') return (CLINICIAN_TYPE_OPTIONS.find((o) => o.id === v)?.title) || v;
    return '';
  };

  const commitFilter = (which, newValue) => {
    if (filters[which] === newValue) return;
    const prevValue = filters[which];
    setFilters((p) => ({ ...p, [which]: newValue }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ label: `Updated to ${labelFor(which, newValue)}`, which, prevValue });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setRefreshing(true);
    refreshTimer.current = setTimeout(() => setRefreshing(false), 700);
  };

  const undoFilter = () => {
    if (!toast) return;
    const { which, prevValue } = toast;
    setFilters((p) => ({ ...p, [which]: prevValue }));
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };

  const onContinue = () => {
    if (continueLoading) return;
    if (!selectedSlot) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ kind: 'validation', label: 'Please select a time slot to continue.' });
      toastTimer.current = setTimeout(() => setToast(null), 3000);
      return;
    }
    setState((s) => ({
      ...s,
      selectedSlot: { day: dayIdx, ...selectedSlot },
      // Persist the filter selections so downstream screens (Meet your
      // clinician, Appointment booked summary) can reflect them.
      apptKind: filters.apptKind,
      gender: filters.gender,
      clinicianType: filters.type,
    }));
    // Show the "Confirming slot availability" loading state briefly, then
    // navigate to the Meet-your-clinician picker.
    setContinueLoading(true);
    setTimeout(() => {
      setContinueLoading(false);
      go('meet-clinician');
    }, 1200);
  };

  return (
    <BookingShell
      go={go} onClose={onClose}
      progress={50}
      breadcrumb={
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0, width: '100%' }}>
          <span style={{ color: '#030712', fontWeight: 600 }}>Booking details</span>
          <span style={{ color: '#4B5563', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member} · {concern} · {clinicianTitle}</span>
        </span>
      }
      footer={
        <button
          onClick={onContinue}
          disabled={continueLoading}
          aria-busy={continueLoading}
          style={{
            all: 'unset', boxSizing: 'border-box',
            cursor: continueLoading ? 'default' : 'pointer',
            pointerEvents: continueLoading ? 'none' : 'auto',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 8, padding: '12px 16px', width: '100%', height: 40,
            background: 'var(--dca-primary)',
            opacity: continueLoading ? 0.5 : 1,
            boxShadow: 'var(--dca-card-shadow)',
            borderRadius: 9999,
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: 'var(--dca-tint)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
          {continueLoading && (
            // LoaderCircle: 3/4 arc that spins continuously while the slot is
            // being confirmed. Inherits the button's #EDF6FF text colour.
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              style={{ animation: 'dcaSpin 800ms linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {continueLoading ? 'Confirming slot availability' : continueLabel}
        </button>
      }>

      <div ref={screenRef} style={{ display: 'none' }} />

      {/* Heading row */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, width: '100%' }}>
        <div style={{
          flex: 1,
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px',
          color: '#030712'
        }}>When would you like your appointment?</div>
        <button
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          aria-expanded={showFilters}
          title={showFilters ? 'Hide filters' : 'Show filters'}
          onClick={() => setShowFilters((v) => !v)}
          style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flexShrink: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            width: 40, height: 40,
            background: showFilters ? 'var(--dca-tint)' : '#FFFFFF',
            border: `1px solid ${showFilters ? 'var(--dca-primary)' : '#FFB306'}`,
            opacity: showFilters ? 1 : 0.6,
            boxShadow: 'var(--dca-card-shadow)',
            borderRadius: 9999
          }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4"
              stroke={showFilters ? 'var(--dca-primary)' : '#030712'}
              strokeWidth="1.33" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Clinician or appointment preferences — toggled by the filter button. */}
      {showFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <div style={{
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: 'var(--dca-primary)'
          }}>Clinician or appointment preferences</div>
          <div style={{
            display: 'flex', flexDirection: 'row', gap: 8, overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            margin: '0 -24px', padding: '4px 24px'
          }} className="dca-hide-scroll">
            <PrefPill label={genderLabel} onClick={() => setActiveSheet('gender')} />
            <PrefPill label={filterTypeLabel} onClick={() => setActiveSheet('type')} />
            <PrefPill label={apptKindLabel} onClick={() => setActiveSheet('apptKind')} />
          </div>
        </div>
      )}

      {/* Next available hero card */}
      {nextAvailable &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <div style={{
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: 'var(--dca-primary)'
          }}>Next available</div>
          <button
            onClick={() => {
              setDayIdx(nextAvailable.dayIdx);
              setOpenBand(nextAvailable.band.id);
              setSelectedSlot({ band: nextAvailable.band.id, h: nextAvailable.slot.h, m: nextAvailable.slot.m });
              // Slide window to include the next-available day if needed.
              setWinStart(Math.min(Math.max(nextAvailable.dayIdx - 1, 0), days.length - 2));
            }}
            style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%',
              display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
              padding: 16,
              background: 'var(--dca-tint)',
              border: '1px solid var(--dca-tint-line)',
              boxShadow: 'var(--dca-card-shadow)',
              borderRadius: 16
            }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 9999,
              background: '#FFFFFF', display: 'grid', placeItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--dca-primary)" strokeWidth="1.6" />
                <path d="M12 7v5l3 2" stroke="var(--dca-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 14, lineHeight: '20px',
                color: '#030712'
              }}>
                {(() => {
                  const idxFromToday = dayDiff(nextAvailable.day, today);
                  const dayWord = idxFromToday === 0
                    ? (nextAvailable.band.id === 'evening' || nextAvailable.band.id === 'overnight' ? 'Tonight' : 'Today')
                    : idxFromToday === 1 ? 'Tomorrow'
                    : idxFromToday <= 6 ? `In ${idxFromToday} days`
                    : `${DAYS_SHORT[nextAvailable.day.getDay()]} ${nextAvailable.day.getDate()} ${MONTHS_SHORT[nextAvailable.day.getMonth()]}`;
                  return `${dayWord} at ${fmtTime(nextAvailable.slot.h, nextAvailable.slot.m)} with ${clinicianTitle === 'Clinician' ? 'an Advanced Clinician' : clinicianTitle.startsWith('A') || clinicianTitle.startsWith('E') ? `an ${clinicianTitle}` : `a ${clinicianTitle}`}`;
                })()}
              </div>
              <div style={{
                fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                color: '#4B5563'
              }}>Tap to select this slot</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 4l4 4-4 4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      }

      {/* Date tabs */}
      <div style={{
        position: 'relative', width: '100%', height: 32,
        display: 'flex', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, padding: '0 8px', width: '100%' }}>
          {visibleDays.map((d) => {
            const idx = winStart + visibleDays.indexOf(d);
            const isSel = idx === dayIdx;
            return (
              <button
                key={idx}
                onClick={() => setDayIdx(idx)}
                style={{
                  all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flex: 1,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  padding: '8px 16px', height: 32,
                  background: isSel ? 'var(--dca-tint)' : '#FFFFFF',
                  border: `${isSel ? 2 : 1}px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-line)'}`,
                  boxShadow: isSel ? 'var(--dca-card-shadow)' : 'none',
                  borderRadius: 16,
                  fontFamily: "'Work Sans'", fontWeight: isSel ? 600 : 400, fontSize: 12, lineHeight: '16px',
                  color: isSel ? 'var(--dca-primary)' : '#030712',
                  whiteSpace: 'nowrap'
                }}>
                {fmtDayPillLabel(d, idx)}
              </button>);
          })}
        </div>
        <button
          aria-label="Previous days"
          onClick={() => setWinStart((w) => Math.max(0, w - 1))}
          disabled={!canPrev}
          style={{
            all: 'unset', cursor: canPrev ? 'pointer' : 'default',
            position: 'absolute', left: -16, top: 'calc(50% - 16px)',
            width: 32, height: 32, display: 'grid', placeItems: 'center',
            background: '#FFFFFF',
            border: '1px solid #FFB306', borderRadius: 9999,
            boxShadow: 'var(--dca-card-shadow)',
            opacity: canPrev ? 1 : 0.5
          }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="#030712" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Next days"
          onClick={() => setWinStart((w) => Math.min(days.length - 2, w + 1))}
          disabled={!canNext}
          style={{
            all: 'unset', cursor: canNext ? 'pointer' : 'default',
            position: 'absolute', right: -16, top: 'calc(50% - 16px)',
            width: 32, height: 32, display: 'grid', placeItems: 'center',
            background: '#FFFFFF',
            border: '1px solid #FFB306', borderRadius: 9999,
            boxShadow: 'var(--dca-card-shadow)',
            opacity: canNext ? 1 : 0.5
          }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="#030712" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Time bands */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {refreshing &&
          <div style={{
            alignSelf: 'center',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
            background: 'var(--dca-tint)', border: '1px solid var(--dca-tint-line)',
            borderRadius: 9999,
            fontFamily: "'Work Sans'", fontWeight: 500, fontSize: 11, lineHeight: '14px',
            color: 'var(--dca-primary)'
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
              style={{ animation: 'dcaSpin 800ms linear infinite' }}>
              <path d="M8 2a6 6 0 016 6" stroke="var(--dca-primary)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Updating availability…
          </div>
        }
        {visibleBands.map((band) => {
          const slots = timesForBand(currentDay, band, dayIdx === 0 ? NOW : null);
          const isOpen = openBand === band.id;
          return (
            <div
              key={band.id}
              data-dca-card
              style={{
                boxSizing: 'border-box', width: '100%',
                background: 'var(--dca-card-bg)',
                border: 'var(--dca-card-border-w) solid var(--dca-tint-line)',
                borderRadius: 16, padding: 16,
                boxShadow: 'var(--dca-card-shadow)'
              }}>
              <button
                onClick={() => { setOpenBand(isOpen ? null : band.id); }}
                aria-expanded={isOpen}
                style={{
                  all: 'unset', cursor: 'pointer', width: '100%',
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8
                }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                    color: '#030712'
                  }}>{getBandLabel(band, currentDay, dayIdx)}</div>
                  <div style={{
                    fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px',
                    color: '#4B5563'
                  }}>{slots.length} times available</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease', flexShrink: 0 }}>
                  <path d="M4 6l4 4 4-4" stroke="var(--dca-primary)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && slots.length > 0 &&
              <div style={{
                marginTop: 12, paddingTop: 4,
                display: 'flex', flexDirection: 'column'
              }}>
                  {slots.map((slot, i) => {
                  const isSel = selectedSlot &&
                  selectedSlot.h === slot.h && selectedSlot.m === slot.m && openBand === band.id;
                  return (
                    <React.Fragment key={`${slot.h}-${slot.m}`}>
                        {i > 0 && <div style={{ width: '100%', borderTop: '1px solid var(--dca-tint-line)', margin: '10px 0' }} />}
                        <button
                        onClick={() => setSelectedSlot({ band: band.id, h: slot.h, m: slot.m })}
                        style={{
                          all: 'unset', cursor: 'pointer', width: '100%',
                          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8
                        }}>
                          <span style={{
                          width: 16, height: 16, borderRadius: 9999, flexShrink: 0,
                          border: `1px solid ${isSel ? 'var(--dca-primary)' : 'var(--dca-tint-border)'}`,
                          background: '#fff',
                          display: 'grid', placeItems: 'center'
                        }}>
                            {isSel && <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--dca-primary)' }} />}
                          </span>
                          <span style={{
                          fontFamily: "'Work Sans'", fontWeight: isSel ? 600 : 400, fontSize: 12, lineHeight: '16px',
                          color: '#030712'
                        }}>{fmtTime(slot.h, slot.m)}</span>
                        {band.id === 'overnight' &&
                          <span style={{
                            fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 11, lineHeight: '14px',
                            color: '#4B5563'
                          }}>· {DAYS_SHORT[addDays(currentDay, 1).getDay()]}</span>
                        }
                        </button>
                      </React.Fragment>);
                })}
                </div>
              }
            </div>);
        })}

      </div>

      {/* Filter sheets — portal into the device frame so they cover the full screen */}
      {activeSheet && frameEl && ReactDOM.createPortal(
        <FilterSheetHost
          which={activeSheet}
          filters={filters}
          setFilters={setFilters}
          concern={concern}
          onCommit={commitFilter}
          onClose={() => setActiveSheet(null)} />,
        frameEl
      )}

      {/* Toast — filter changes anchor near the top; validation messages sit
          directly above the sticky footer so the Continue button doesn't
          obscure them. */}
      {toast && frameEl && ReactDOM.createPortal(
        <div style={{
          position: 'absolute',
          ...(toast.kind === 'validation'
            ? { bottom: 100 }
            : { top: 60 }),
          left: '50%', transform: 'translateX(-50%)',
          display: 'inline-flex', alignItems: 'center', gap: 16,
          padding: '8px 16px', background: '#030712', borderRadius: 9999,
          boxShadow: '0 12px 24px rgba(0,0,0,0.24)',
          fontFamily: "'Work Sans'", fontWeight: 500, fontSize: 12, lineHeight: '16px',
          color: '#FFFFFF', zIndex: 400, whiteSpace: 'nowrap',
          animation: 'dcaToastIn 200ms ease-out'
        }}>
          <span>{toast.label}</span>
          {toast.kind !== 'validation' && (
            <button onClick={undoFilter} style={{
              all: 'unset', cursor: 'pointer',
              color: '#FAC775', fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12
            }}>Undo</button>
          )}
        </div>,
        frameEl
      )}

      <style>{`
        .dca-hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes dcaFilterFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dcaFilterSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes dcaToastIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes dcaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </BookingShell>);
}

Object.assign(window, {
  StatusBarOverlay, BookingHeader, PrimaryButton, SecondaryButton, Chevron, InfoIcon,
  PulseDot, TabBar, BookingShell, PillCTA,
  AvailabilityHint, HomeScreen, EmergencyScreen, MemberScreen, SearchScreen, ConcernScreen, AttachScreen,
  ClinicianTypeScreen, TimeOfDayScreen,
  CATEGORIES, CONCERNS, CATEGORY_IMAGES,
  BLUE, BLUE_HEADER, BLUE_50, BLUE_100, BLUE_200, NAVY, NAVY_700, GREY_BG, GREY_BORDER, GREY_TEXT, GREY_400, GREEN, GREEN_100, YELLOW, AMBER_50, AMBER_700
});