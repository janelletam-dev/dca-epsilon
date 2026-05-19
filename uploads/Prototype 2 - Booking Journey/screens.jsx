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
const YELLOW = '#FFB407';
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
      WebkitFontSmoothing: 'antialiased',
    }}>
      <span style={{ color, fontWeight: 600, fontSize: 15 }}>2:39</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={color}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
          <path d="M8 2.4c2.1 0 4 .8 5.4 2.2l1-1A8.5 8.5 0 008 1a8.5 8.5 0 00-6.4 2.6l1 1A7.7 7.7 0 018 2.4z"/>
          <path d="M8 5.6c1.3 0 2.5.5 3.4 1.4l1-1a6 6 0 00-8.8 0l1 1A4.7 4.7 0 018 5.6z"/>
          <circle cx="8" cy="9.5" r="1.4"/>
        </svg>
        <svg width="25" height="11" viewBox="0 0 25 11">
          <rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke={color} strokeOpacity="0.5"/>
          <rect x="2" y="2" width="11" height="7" rx="1" fill={color}/>
          <path d="M23 3.5v4c.6-.2 1-.8 1-1.5v-1c0-.7-.4-1.3-1-1.5z" fill={color} fillOpacity="0.5"/>
        </svg>
      </div>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 30, borderRadius: 18, background: '#000',
      }}/>
    </div>
  );
}

function BookingHeader({ go, title = 'Book an appointment', tone = 'blue', onClose }) {
  const bg = tone === 'green' ? GREEN : BLUE_HEADER;
  return (
    <div style={{
      background: bg, color: '#fff',
      padding: '52px 16px 14px', position: 'relative', zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <button onClick={() => go('back')} aria-label="Back" style={{
        all: 'unset', cursor: 'pointer', padding: 8, marginLeft: -4,
        display: 'flex', alignItems: 'center',
      }}>
        {tone === 'green' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
            <path d="M9.5 1.5L2 9l7.5 7.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.1 }}>{title}</div>
      <button onClick={onClose} aria-label="Close" style={{
        all: 'unset', cursor: 'pointer', padding: 8, marginRight: -4,
        display: 'flex', alignItems: 'center',
        opacity: tone === 'green' ? 0 : 1,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 2l12 12M14 2L2 14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
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
        color: '#fff', fontWeight: 600, fontSize: 15.5, letterSpacing: -0.1,
      }}
    >{children}</button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', boxSizing: 'border-box',
      width: '100%', textAlign: 'center', cursor: 'pointer',
      padding: '13px 18px', borderRadius: 999,
      border: `1.5px solid ${BLUE}`, color: BLUE, background: '#fff',
      fontWeight: 700, fontSize: 14.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

function Chevron({ color = '#9AA3B2', size = 14 }) {
  return (
    <svg width={size*0.6} height={size} viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function InfoIcon({ size = 16, color = BLUE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/>
      <path d="M12 11v6M12 7.5v.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function PulseDot({ color = GREEN }) {
  return (
    <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 999, background: color,
        animation: 'dca-pulse 1.6s ease-out infinite',
      }}/>
      <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: color }}/>
      <style>{`@keyframes dca-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}`}</style>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar (shared)
// ─────────────────────────────────────────────────────────────
function TabBar({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg> },
    { id: 'appts', label: 'Appointments', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M4 9h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: 'rx', label: 'Prescriptions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M9 8h6M9 12h6M12 16v3M10.5 17.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: 'up', label: 'Uploads', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 19V8l4-4h8a2 2 0 012 2v13a2 2 0 01-2 2H7a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 16v-6m-3 3l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'med', label: 'Medical History', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 7a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M14 5v5h5" stroke="currentColor" strokeWidth="2"/></svg> },
  ];
  return (
    <div style={{ background: '#fff', borderTop: `1px solid ${GREY_BORDER}`, padding: '6px 4px 22px', display: 'flex', flexShrink: 0 }}>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? BLUE : '#6B7280', padding: '6px 0',
            fontSize: 10, fontWeight: 600,
          }}>
            {it.icon}
            <span style={{ letterSpacing: -0.1 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 01 — HOME (V2)
//   • Cover/policy card (B2B fully covered vs PAYG £35/appt)
//   • "ACPs available in next 4h" pulse
// ═════════════════════════════════════════════════════════════
function AvailabilityHint({ mode = 'none' }) {
  if (mode === 'noslots') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: AMBER_700, fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: YELLOW, flexShrink: 0 }}/>
        <span><strong>No slots today</strong> · earliest tomorrow 7:00am</span>
      </div>
    );
  }
  if (mode === 'fewhours') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: AMBER_700, fontWeight: 600 }}>
        <PulseDot color={YELLOW}/>
        <span><strong>3 clinicians</strong> available in the next 4 hours</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: NAVY_700, fontWeight: 600 }}>
      <PulseDot color={GREEN}/>
      <span><strong style={{ color: GREEN }}>32 clinicians</strong> available in the next 4 hours</span>
    </div>
  );
}

function HomeScreen({ go, persona, errorMode = 'none' }) {
  const isB2B = persona === 'b2b';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: GREY_BG }}>
      {/* Hero header */}
      <div style={{
        background: BLUE_HEADER, color: '#fff', padding: '52px 16px 18px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <img src="assets/dca-logo.png" alt="DCA" style={{ height: 32, width: 32, flexShrink: 0, display: 'block' }}/>
          <button style={{ all: 'unset', cursor: 'pointer', padding: 6 }} aria-label="Menu">
            <svg width="22" height="16" viewBox="0 0 22 16"><g stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="20" y2="2"/>
              <line x1="2" y1="8" x2="20" y2="8"/>
              <line x1="2" y1="14" x2="20" y2="14"/>
            </g></svg>
          </button>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Hi, Test.</div>
        <div style={{ fontSize: 16, fontWeight: 400, opacity: 0.95, marginTop: 2 }}>What can we help you with?</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '12px 14px 0', overflow: 'auto' }}>
        {/* Coverage card — varies by persona */}
        <CoverageCard persona={persona}/>

        {/* Book CTA with availability pulse */}
        <button
          onClick={() => go('emergency')}
          style={{
            all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box',
            background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
            padding: '14px 14px', marginTop: 10,
            boxShadow: '0 1px 2px rgba(6,23,49,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY, marginBottom: 4 }}>Book an appointment</div>
              <div style={{ fontSize: 12.5, color: GREY_TEXT, lineHeight: 1.45, marginBottom: 8 }}>
                Video and phone appointments available 24/7, all year round.
              </div>
              <AvailabilityHint mode={errorMode}/>
            </div>
            <Chevron color={BLUE}/>
          </div>
        </button>


      </div>

      <TabBar active="home"/>
    </div>
  );
}

function QuickAction({ label, icon }) {
  return (
    <button style={{
      all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
      background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE_50, display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ fontSize: 12.5, color: NAVY, fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
    </button>
  );
}

function CoverageCard({ persona }) {
  if (persona === 'b2b') {
    return (
      <div style={{
        background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <ShieldIcon color={GREEN}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, color: NAVY, fontWeight: 700, letterSpacing: -0.2 }}>Your Policy Status</div>
            <div style={{ fontSize: 13.5, color: NAVY, marginTop: 2, lineHeight: 1.4 }}>
              You're covered by <strong>AXA Health · Plan A</strong>. Appointments cost <strong style={{ color: GREEN }}>£0</strong>.
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GREY_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: GREEN, flexShrink: 0 }}/>
            <div style={{ fontSize: 12.5, color: GREY_TEXT }}>
              <strong style={{ color: NAVY }}>Active</strong> · renews 12 Jan 2027
            </div>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
          }}>
            See details
            <svg width="6" height="10" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ShieldIcon color={BLUE}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, color: NAVY, fontWeight: 700, letterSpacing: -0.2 }}>Your Policy Status</div>
          <div style={{ fontSize: 13.5, color: NAVY, marginTop: 2, lineHeight: 1.4 }}>
            Your account is now a <strong>Pay-As-You-Go (PAYG)</strong> plan.
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GREY_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: GREY_TEXT }}>Appointments from</div>
          <div style={{ fontSize: 18, color: NAVY, fontWeight: 700, letterSpacing: -0.3, marginTop: 1 }}>
            £45 <span style={{ fontSize: 12, color: GREY_TEXT, fontWeight: 500 }}>per appointment</span>
          </div>
        </div>
        <button style={{
          all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        }}>
          See details
          <svg width="6" height="10" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function ShieldIcon({ color = '#3D7BFF' }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M11 1.5L1.5 5v8.2c0 6 4.2 9.7 9.5 11.3 5.3-1.6 9.5-5.3 9.5-11.3V5L11 1.5z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════
// 02 — Not for emergencies (unchanged)
// ═════════════════════════════════════════════════════════════
function EmergencyScreen({ go, onClose }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Not for emergencies</h2>
          <InfoIcon/>
        </div>
        <div style={{ background: BLUE_50, border: `1px solid ${BLUE_100}`, borderRadius: 10, padding: 14, fontSize: 13.5, color: GREY_TEXT, lineHeight: 1.5 }}>
          Our clinicians cannot assess or treat medical emergencies. If your or your child's symptoms worsen while you are waiting for your appointment, you may need to seek more urgent care. In an emergency, please contact emergency services (111/999) or visit your nearest A&E department.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 8px' }}>
          <img src="assets/clinician.png" alt="Clinician" style={{ width: 220, height: 'auto', display: 'block' }}/>
        </div>
      </div>
      <div style={{ padding: '8px 16px 28px', flexShrink: 0 }}>
        <PrimaryButton onClick={() => go('member')}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 03 — Select a member
// ═════════════════════════════════════════════════════════════
function MemberScreen({ go, onClose }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 16px' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select a member</h2>
        <button onClick={() => go('search')} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', gap: 12, width: '100%',
          background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
          padding: '14px', marginBottom: 10, boxShadow: '0 1px 2px rgba(6,23,49,0.04)',
        }}>
          <img src="assets/user-sample.png" alt="" style={{ width: 38, height: 38, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} onError={(e)=>{ e.currentTarget.style.background='#E8EAED'; e.currentTarget.removeAttribute('src');}}/>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 14.5 }}>Test Demo User</div>
            <div style={{ fontSize: 12.5, color: GREY_TEXT, marginTop: 1 }}>(Myself)</div>
          </div>
          <Chevron/>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
          padding: '14px', boxShadow: '0 1px 2px rgba(6,23,49,0.04)',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: BLUE_100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="9" r="4" stroke={BLUE} strokeWidth="1.8"/><path d="M3 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/><path d="M18 8v6M15 11h6" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>Need to book for someone else?</div>
            <div style={{ fontSize: 13, color: BLUE, fontWeight: 600, marginTop: 2, textDecoration: 'underline' }}>Manage my account</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 04 — Search & Browse (consolidated categories + concerns)
// ═════════════════════════════════════════════════════════════
const CATEGORIES = [
  { id: 'ill', name: 'Minor illnesses', sub: 'Cold sores, Flu, Cough, Fever' },
  { id: 'joints', name: 'Joints and Muscles', sub: 'Ankle, Back, Elbow, Foot, Hand, Knee' },
  { id: 'ent', name: 'Eyes, Ears, Nose & Throat', sub: 'Ear, Eye Symptoms, Sinusitis' },
  { id: 'skin', name: 'Skin, Hair & Nails', sub: 'Acne, Cold Sores, Eczema, Rash' },
  { id: 'wh', name: "Women's health", sub: 'Breast Symptoms, Bloating, Periods' },
  { id: 'gut', name: 'Gut Health', sub: 'Bloating, Pain, Constipation, Diarrhoea' },
  { id: 'resp', name: 'Respiratory Health', sub: 'Covid-19, Cough, Cold/Flu' },
  { id: 'heart', name: 'Heart Health', sub: 'Palpitations, Heart Symptoms' },
  { id: 'headache', name: 'Headaches & Dizziness', sub: 'Dizziness, Headache' },
  { id: 'mh', name: 'Mental Health & Wellbeing', sub: 'Anxiety, Low mood, Snoring' },
  { id: 'mens', name: "Men's Health", sub: 'Genital, Urinary' },
  { id: 'followup', name: 'Health Check Follow-Up', sub: 'Review and follow-up appts' },
];

const CATEGORY_IMAGES = {
  skin: 'assets/cat-skin.png', ill: 'assets/cat-ill.png', ent: 'assets/cat-ent.png',
  wh: 'assets/cat-wh.png', mh: 'assets/cat-mh.png', gut: 'assets/cat-gut.png',
  heart: 'assets/cat-heart.png', headache: 'assets/cat-headache.png',
  mens: 'assets/cat-mens.png', followup: 'assets/cat-followup.png',
  joints: 'assets/cat-joints.png', resp: 'assets/cat-resp.png',
};

const CONCERNS = [
  { name: 'Acne', cat: 'skin' }, { name: 'Anxiety', cat: 'mh' },
  { name: 'Back pain', cat: 'joints' }, { name: 'Bloating', cat: 'gut' },
  { name: 'Breast Symptoms', cat: 'wh' }, { name: 'Chickenpox & Shingles', cat: 'skin' },
  { name: 'Cold Sores', cat: 'skin' }, { name: 'Cough', cat: 'resp' },
  { name: 'Constipation', cat: 'gut' }, { name: 'Covid-19', cat: 'resp' },
  { name: 'Diarrhoea', cat: 'gut' }, { name: 'Dizziness', cat: 'headache' },
  { name: 'Ear Symptoms', cat: 'ent' }, { name: 'Eczema', cat: 'skin' },
  { name: 'Eye Symptoms', cat: 'ent' }, { name: 'Fever', cat: 'ill' },
  { name: 'Flu', cat: 'ill' }, { name: 'Genital Symptoms', cat: 'mens' },
  { name: 'Hair Concerns', cat: 'skin' }, { name: 'Headache', cat: 'headache' },
  { name: 'Heart Palpitations', cat: 'heart' }, { name: 'Knee pain', cat: 'joints' },
  { name: 'Low mood', cat: 'mh' }, { name: 'Moles & Skin Lesions', cat: 'skin' },
  { name: 'Nail Symptoms', cat: 'skin' }, { name: 'Periods', cat: 'wh' },
  { name: 'Rash', cat: 'skin' }, { name: 'Sinusitis', cat: 'ent' },
  { name: 'Snoring', cat: 'mh' }, { name: 'Sore throat', cat: 'ent' },
  { name: 'UTI', cat: 'mens' }, { name: 'Warts', cat: 'skin' },
];

function SearchScreen({ go, setState, onClose }) {
  const [q, setQ] = React.useState('');
  const ql = q.trim().toLowerCase();
  const matchedCats = ql ? CATEGORIES.filter(c => c.name.toLowerCase().includes(ql) || c.sub.toLowerCase().includes(ql)) : [];
  const matchedConcerns = ql ? CONCERNS.filter(c => c.name.toLowerCase().includes(ql)) : [];

  const choose = (cat, concern) => {
    setState(s => ({ ...s, category: cat?.name || s.category, concern: concern?.name || null }));
    if (concern) go('attach');
    else { setState(s => ({ ...s, category: cat.name })); go('concern'); }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>What do you need help with?</h2>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          border: `1.5px solid ${q ? BLUE : GREY_BORDER}`, borderRadius: 12, background: '#fff',
          marginBottom: 14,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={BLUE} strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search 'cough', 'rash', 'anxiety'..." style={{ flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 15, color: NAVY }}/>
          {q && <button onClick={()=>setQ('')} style={{ all: 'unset', cursor: 'pointer', color: GREY_400, padding: 4 }}>
            <svg width="14" height="14" viewBox="0 0 16 16"><path d="M2 2l12 12M14 2L2 14" stroke={GREY_400} strokeWidth="2" strokeLinecap="round"/></svg>
          </button>}
        </div>

        {/* Search results */}
        {ql && (
          <>
            {matchedConcerns.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Concerns</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                  {matchedConcerns.slice(0, 6).map(c => {
                    const cat = CATEGORIES.find(x => x.id === c.cat);
                    return (
                      <button key={c.name} onClick={() => choose(cat, c)} style={{
                        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
                        alignItems: 'center', gap: 12, padding: '11px 12px',
                        background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: BLUE_100, display: 'grid', placeItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={BLUE} strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <Highlight text={c.name} q={ql} bold/>
                          <div style={{ fontSize: 11.5, color: GREY_TEXT, marginTop: 1 }}>{cat?.name}</div>
                        </div>
                        <Chevron/>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {matchedCats.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Categories</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                  {matchedCats.map(cat => (
                    <CategoryRow key={cat.id} cat={cat} onClick={() => choose(cat)}/>
                  ))}
                </div>
              </>
            )}
            {matchedCats.length === 0 && matchedConcerns.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: GREY_TEXT }}>
                <div style={{ fontWeight: 600, color: NAVY, marginBottom: 4 }}>No matches for "{q}"</div>
                <div style={{ fontSize: 13 }}>Try browsing health categories below.</div>
              </div>
            )}
          </>
        )}

        {/* Browse all */}
        {!ql && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Recent searches</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {['Cough', 'Acne', 'Anxiety'].map(t => (
                <button key={t} onClick={() => setQ(t)} style={{
                  all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
                  background: '#F4F4F4', color: NAVY, fontSize: 12.5, fontWeight: 500,
                }}>{t}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Browse by category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CATEGORIES.map(cat => <CategoryRow key={cat.id} cat={cat} onClick={() => choose(cat)}/>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ cat, onClick }) {
  const img = CATEGORY_IMAGES[cat.id];
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
      alignItems: 'stretch', width: '100%', height: 64,
      background: '#F4F4F4', borderRadius: 10, overflow: 'hidden',
    }}>
      {img ? <img src={img} alt="" style={{ width: 64, height: '100%', objectFit: 'cover', flexShrink: 0 }}/> : <div style={{ width: 64, background: BLUE_100, flexShrink: 0 }}/>}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textAlign: 'left', minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5, marginBottom: 1 }}>{cat.name}</div>
          <div style={{ fontSize: 11.5, color: GREY_TEXT, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{cat.sub}</div>
        </div>
        <Chevron color={NAVY}/>
      </div>
    </button>
  );
}

function Highlight({ text, q, bold }) {
  if (!q) return <span style={{ fontWeight: bold ? 600 : 400, color: NAVY, fontSize: 14 }}>{text}</span>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <span style={{ fontWeight: bold ? 600 : 400, color: NAVY, fontSize: 14 }}>{text}</span>;
  return (
    <span style={{ color: NAVY, fontSize: 14, fontWeight: bold ? 600 : 400 }}>
      {text.slice(0, i)}<mark style={{ background: '#FFF3B8', color: NAVY, padding: 0 }}>{text.slice(i, i+q.length)}</mark>{text.slice(i+q.length)}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════
// 05 — Concern (when chosen by category)
// ═════════════════════════════════════════════════════════════
function ConcernScreen({ go, state, setState, onClose }) {
  const cat = CATEGORIES.find(c => c.name === state.category);
  const list = cat ? CONCERNS.filter(c => c.cat === cat.id) : CONCERNS;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 24px' }}>
        <div style={{ fontSize: 12, color: GREY_TEXT, marginBottom: 4 }}>{state.category}</div>
        <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select a health concern</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map(c => (
            <button key={c.name} onClick={() => { setState(s => ({ ...s, concern: c.name })); go('attach'); }} style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex',
              alignItems: 'center', gap: 12, width: '100%',
              background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
              padding: '14px', boxShadow: '0 1px 2px rgba(6,23,49,0.04)',
            }}>
              <div style={{ flex: 1, textAlign: 'left', fontWeight: 600, color: NAVY, fontSize: 14.5 }}>{c.name}</div>
              <Chevron/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// 06 — Attach file (carries through)
// ═════════════════════════════════════════════════════════════
function AttachScreen({ go, onClose }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>
            Attach file <span style={{ fontWeight: 500, color: GREY_TEXT }}>(Optional)</span>
          </h2>
          <InfoIcon/>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: GREY_TEXT, lineHeight: 1.5 }}>
          Uploading a high quality photo or documents relevant to your symptoms helps you get the most out of seeing our clinicians.
        </p>
        <button style={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px 18px', borderRadius: 999,
          border: `1.5px dashed ${BLUE}`, color: BLUE, fontWeight: 700, fontSize: 14.5, background: '#fff',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke={BLUE} strokeWidth="1.8"/><path d="M14 3v5h5" stroke={BLUE} strokeWidth="1.8"/></svg>
          Upload a file
        </button>
      </div>
      <div style={{ padding: '8px 16px 28px', flexShrink: 0 }}>
        <PrimaryButton onClick={() => go('appt')}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, {
  StatusBarOverlay, BookingHeader, PrimaryButton, SecondaryButton, Chevron, InfoIcon,
  PulseDot, TabBar,
  AvailabilityHint, HomeScreen, EmergencyScreen, MemberScreen, SearchScreen, ConcernScreen, AttachScreen,
  CATEGORIES, CONCERNS, CATEGORY_IMAGES,
  BLUE, BLUE_HEADER, BLUE_50, BLUE_100, BLUE_200, NAVY, NAVY_700, GREY_BG, GREY_BORDER, GREY_TEXT, GREY_400, GREEN, GREEN_100, YELLOW, AMBER_50, AMBER_700,
});
