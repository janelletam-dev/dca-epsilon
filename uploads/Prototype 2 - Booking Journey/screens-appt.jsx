// DCA Booking Journey V2 — Appointment selection + ancillary screens

const CLINICIANS = [
  { id: 'a1', name: 'Sarah Mitchell', role: 'ACP', tone: 'blue', slots: ['3:00pm','3:15pm'], previous: false },
  { id: 'p1', name: 'Priya Patel', role: 'ACP', img: 'assets/irina.png', slots: ['3:00pm','3:15pm'], previous: true },
  { id: 'a3', name: 'James Carter', role: 'ACP', tone: 'navy', slots: ['3:00pm','3:15pm'], previous: false },
  { id: 'd1', name: 'Dr Emma Hughes', role: 'Doctor', img: 'assets/user-sample.png', slots: ['3:20pm','3:40pm'], previous: false },
  { id: 'd2', name: 'Dr Michael Chen', role: 'Doctor', tone: 'blue', slots: ['3:20pm','3:40pm'], previous: false },
  { id: 'a4', name: 'Olivia Wright', role: 'ACP', tone: 'green-empty', slots: ['3:30pm','3:45pm'], previous: false },
  { id: 'd3', name: 'Dr Daniel Foster', role: 'Doctor', tone: 'blue', slots: ['3:30pm','3:45pm'], previous: false },
  { id: 'd4', name: 'Dr Rachel Adams', role: 'Doctor', tone: 'blue', slots: ['4:00pm','4:15pm'], previous: false },
  { id: 'a5', name: 'Anna Brooks', role: 'ACP', tone: 'grey', slots: ['4:00pm','4:15pm'], previous: false },
];

function ClinicianAvatar({ c, size = 36 }) {
  if (c.img) return <img src={c.img} alt="" style={{ width: size, height: size, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} onError={(e)=>{ e.currentTarget.outerHTML='<div style="width:'+size+'px;height:'+size+'px;border-radius:999px;background:#E8EAED;flex-shrink:0;"></div>'; }}/>;
  const colors = { blue: BLUE, navy: '#2D333F', grey: GREY_400, 'green-empty': GREEN };
  const bg = colors[c.tone] || '#E8EAED';
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0, color: '#fff' }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4" fill="#fff"/>
        <path d="M3 21c0-4 4-7 9-7s9 3 9 7" fill="#fff"/>
      </svg>
    </div>
  );
}

function SlotChip({ label, selected, recommended, onClick }) {
  let bg = '#fff', color = NAVY, border = '#D1D5DB';
  if (selected) { bg = GREEN; color = '#fff'; border = GREEN; }
  else if (recommended) { bg = BLUE_50; border = BLUE; color = BLUE; }
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', textAlign: 'center',
      padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${border}`,
      background: bg, color, fontWeight: selected || recommended ? 700 : 500, fontSize: 12.5,
      whiteSpace: 'nowrap', position: 'relative',
    }}>{label}</button>
  );
}

function ClinicianCard({ c, selectedKey, onSelect, recommendedKey, anonymise }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
      padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {anonymise ? (
          <div style={{ width: 32, height: 32, borderRadius: 999, background: BLUE_100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="4" stroke={BLUE} strokeWidth="2"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ) : <ClinicianAvatar c={c} size={32}/>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5, letterSpacing: -0.1, display: 'flex', alignItems: 'center', gap: 6 }}>
            {anonymise ? `Available ${c.role === 'ACP' ? 'Practitioner' : 'Doctor'}` : c.name}
            {c.previous && !anonymise && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: BLUE_100, color: BLUE, letterSpacing: 0.2 }}>SEEN BEFORE</span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: GREY_TEXT, marginTop: 0 }}>
            {c.role === 'ACP' ? 'Advanced Clinical Practitioner' : 'Doctor (GP)'}
          </div>
        </div>
      </div>
      {c.slots.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {c.slots.map(slot => {
            const key = c.id + '|' + slot;
            return <SlotChip key={slot} label={`Today, ${slot}`} selected={selectedKey === key} recommended={recommendedKey === key && !selectedKey} onClick={() => onSelect(c, slot)}/>;
          })}
        </div>
      )}
    </div>
  );
}

// On-page filter dropdowns (replaces overlay)
function FilterDropdowns({ filters, setFilters, options, anonymise }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, paddingBottom: 4 }}>
      <FilterPill label="Clinician type" value={filters.type} options={['ACP', 'Doctors', 'Mental health practitioners', 'Physiotherapists']} onChange={(v)=>setFilters(f=>({...f, type: v}))}/>
      <FilterPill label="Appointment" value={filters.apptType} options={['Video']} onChange={(v)=>setFilters(f=>({...f, apptType: v}))}/>
      <FilterPill label="Gender" value={filters.gender} options={['Any', 'Male', 'Female']} onChange={(v)=>setFilters(f=>({...f, gender: v}))}/>
    </div>
  );
}

function FilterPill({ label, value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const btnRef = React.useRef(null);
  const isDefault = !value || value === options[0];

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen(o => !o);
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button ref={btnRef} onClick={toggle} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 999,
        border: `1.5px solid ${isDefault ? GREY_BORDER : BLUE}`,
        background: isDefault ? '#fff' : BLUE_50,
        color: isDefault ? NAVY : BLUE, fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap',
      }}>
        <span style={{ color: isDefault ? GREY_TEXT : BLUE }}>{label}:</span>
        <strong>{value || options[0]}</strong>
        <svg width="9" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1l3.5 3.5L8 1" stroke={isDefault ? GREY_TEXT : BLUE} strokeWidth="1.6" strokeLinecap="round"/></svg>
      </button>
      {open && pos && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }}/>
          <div style={{
            position: 'fixed', top: pos.top, left: pos.left, zIndex: 201,
            background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10,
            boxShadow: '0 12px 24px rgba(6,23,49,0.16)', minWidth: 200, padding: 4,
          }}>
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
                all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13.5, color: NAVY, fontWeight: 500, boxSizing: 'border-box',
                background: o === (value || options[0]) ? BLUE_50 : 'transparent',
              }}>
                {o}
                {o === (value || options[0]) && <svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 5" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ApptScreen({ go, state, setState, onClose, anonymise, errorMode = 'none' }) {
  const [filters, setFilters] = React.useState({ type: 'ACP', apptType: 'Video', gender: 'Any' });
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  const filtered = React.useMemo(() => {
    let list = [...CLINICIANS];
    if (filters.type === 'ACP') list = list.filter(c => c.role === 'ACP');
    if (filters.type === 'Doctors') list = list.filter(c => c.role === 'Doctor');
    if (filters.type === 'Mental health practitioners' || filters.type === 'Physiotherapists') list = [];
    return list;
  }, [filters]);

  const recommendedKey = filtered[0] && filtered[0].slots[0] ? filtered[0].id + '|' + filtered[0].slots[0] : null;
  const selectedKey = state.selectedSlot;

  // Auto-pre-select on mount/filter change
  React.useEffect(() => {
    if (!state.selectedSlot && recommendedKey) {
      const c = filtered[0];
      setState(s => ({ ...s, selectedSlot: recommendedKey, clinician: c, slot: c.slots[0] }));
    }
  }, [recommendedKey]); // eslint-disable-line

  const onSelect = (c, slot) => setState(s => ({ ...s, selectedSlot: c.id + '|' + slot, clinician: c, slot }));

  const previous = filtered.filter(c => c.previous);
  const others = filtered.filter(c => !c.previous);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', position: 'relative' }}>
      <BookingHeader go={go} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px 14px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select an appointment</h2>

        {/* Summary chip (collapsed appointment details — like widget) */}
        <button onClick={() => go('summary-edit')} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
          width: '100%', padding: '8px 12px', borderRadius: 8, background: BLUE_50, border: `1px solid ${BLUE_100}`,
          marginBottom: 12, gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{ flex: 1, textAlign: 'left', fontSize: 12, color: NAVY, lineHeight: 1.3 }}>
            <strong>{state.member}</strong> · {state.category || 'Skin'} · <strong>{state.concern || 'Acne'}</strong>
          </div>
          <span style={{ color: BLUE, fontSize: 11.5, fontWeight: 700 }}>Edit</span>
        </button>

        {/* Filter dropdowns */}
        <FilterDropdowns filters={filters} setFilters={setFilters} anonymise={anonymise}/>

        {/* What clinicians can do */}
        <button onClick={() => setShowInfo(v => !v)} style={{
          all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12.5, color: BLUE, fontWeight: 600, marginBottom: 12, padding: '4px 0',
        }}>
          <InfoIcon size={14}/>
          What can {filters.type === 'Doctor' ? 'GPs' : 'ACPs'} do?
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ transform: showInfo ? 'rotate(180deg)' : 'none' }}><path d="M1 1l3.5 3.5L8 1" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
        {showInfo && (
          <div style={{ background: BLUE_50, border: `1px solid ${BLUE_100}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12.5, color: NAVY, lineHeight: 1.5 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: GREEN, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 4 }}>✓ Can do</div>
                <div style={{ color: GREY_TEXT, fontSize: 12 }}>Diagnose & treat common conditions, prescribe most medication, sick notes, refer to specialists.</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#D9364C', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 4 }}>✗ Cannot do</div>
                <div style={{ color: GREY_TEXT, fontSize: 12 }}>Controlled drugs, complex chronic management, fit-to-fly notes.</div>
              </div>
            </div>
          </div>
        )}

        {errorMode === 'noslots' && (
          <EmptyStateCard go={go} onSetReminder={() => go('reminder')}/>
        )}

        {errorMode === 'fewhours' && (
          <FewHoursCard onSetReminder={() => go('reminder')} onPickDate={() => setShowCalendar(true)} setFilters={setFilters}/>
        )}

        {errorMode === 'none' && (
          <>
            {previous.length > 0 && (
              <>
                <SectionHeading>Clinicians you've seen before</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {previous.map(c => <ClinicianCard key={c.id} c={c} selectedKey={selectedKey} onSelect={onSelect} recommendedKey={recommendedKey} anonymise={anonymise}/>)}
                </div>
              </>
            )}
            <SectionHeading>
              Next available
              <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, background: BLUE_50, padding: '2px 8px', borderRadius: 999, marginLeft: 8 }}>Recommended pre-selected</span>
            </SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {others.map(c => <ClinicianCard key={c.id} c={c} selectedKey={selectedKey} onSelect={onSelect} recommendedKey={recommendedKey} anonymise={anonymise}/>)}
            </div>

            <div style={{ marginTop: 16, padding: '12px 14px', background: '#FAFAFA', borderRadius: 10, border: `1px dashed ${GREY_BORDER}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <InfoIcon size={16} color={GREY_TEXT}/>
              <div style={{ flex: 1, fontSize: 12, color: GREY_TEXT, lineHeight: 1.45 }}>
                <strong style={{ color: NAVY }}>Looking for other times?</strong>{' '}
                Tap <button onClick={() => setShowCalendar(true)} style={{ all: 'unset', cursor: 'pointer', color: BLUE, fontWeight: 700, textDecoration: 'underline' }}>Select date &amp; time</button> to view more slots later today or in the coming days.
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 14px 24px', background: '#fff', borderTop: `1px solid ${GREY_BORDER}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SecondaryButton onClick={() => setShowCalendar(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="16" rx="2" stroke={BLUE} strokeWidth="1.8"/><path d="M4 9h16M9 3v4M15 3v4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
          Select date &amp; time
        </SecondaryButton>
        <PrimaryButton disabled={!selectedKey || errorMode !== 'none'} onClick={() => go('summary')}>Review &amp; book</PrimaryButton>
      </div>

      {showCalendar && <CalendarSheet onClose={() => setShowCalendar(false)} onDone={(date, range) => { setState(s => ({ ...s, customDate: date, customRange: range })); setShowCalendar(false); }}/>}
    </div>
  );
}

function SectionHeading({ children }) {
  return <div style={{ fontWeight: 700, color: NAVY, fontSize: 14, marginBottom: 8, marginTop: 4, display: 'flex', alignItems: 'center' }}>{children}</div>;
}

function EmptyStateCard({ go, onSetReminder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: AMBER_50, border: `1px solid #F2D98A`, borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={AMBER_700} strokeWidth="1.8"/><path d="M12 7v6M12 16.5v.5" stroke={AMBER_700} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <div style={{ fontWeight: 700, color: AMBER_700, fontSize: 14 }}>No slots today</div>
        </div>
        <div style={{ fontSize: 13, color: '#5C420A', lineHeight: 1.5 }}>
          We're unusually busy. The earliest available slot is <strong>tomorrow at 7:00am</strong> with an Advanced Clinical Practitioner.
        </div>
      </div>
      <button style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', border: `1.5px solid ${BLUE}`, borderRadius: 10, padding: '14px',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: BLUE_50, display: 'grid', placeItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke={BLUE} strokeWidth="2"/></svg>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5 }}>Tomorrow, 7:00am</div>
          <div style={{ fontSize: 12, color: GREY_TEXT }}>Earliest with an ACP · usually faster</div>
        </div>
        <Chevron color={BLUE}/>
      </button>
      <button onClick={onSetReminder} style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10, padding: '14px',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#FFF7E0', display: 'grid', placeItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 9a7 7 0 0114 0c0 7 3 7 3 9H2c0-2 3-2 3-9zM10 21a2 2 0 004 0" stroke={AMBER_700} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 13.5 }}>Set a reminder instead</div>
          <div style={{ fontSize: 12, color: GREY_TEXT }}>We'll nudge you when slots open up</div>
        </div>
        <Chevron/>
      </button>
    </div>
  );
}

function FewHoursCard({ onSetReminder, setFilters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
      <div style={{ background: AMBER_50, border: `1px solid #F2D98A`, borderRadius: 10, padding: 14, fontSize: 13, color: '#5C420A', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700, color: AMBER_700, marginBottom: 4 }}>Limited GP availability</div>
        Next GP slot is at <strong>6:45pm</strong>. An ACP could see you in just 12 minutes.
      </div>
      <button onClick={() => setFilters(f => ({ ...f, type: 'ACP' }))} style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
        background: BLUE, color: '#fff', borderRadius: 10, padding: '12px 14px', gap: 10,
      }}>
        <PulseDot color="#fff"/>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Switch to ACP — see someone in 12 min</div>
          <div style={{ fontSize: 11.5, opacity: 0.85 }}>ACPs can prescribe, refer & treat 90% of GP cases</div>
        </div>
        <Chevron color="#fff"/>
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Calendar + start/end time range sheet
// ═════════════════════════════════════════════════════════════
function CalendarSheet({ onClose, onDone }) {
  const today = new Date(2026, 3, 28); // 28 Apr 2026
  const [month, setMonth] = React.useState({ y: 2026, m: 3 });
  const [picked, setPicked] = React.useState(today);
  const [start, setStart] = React.useState(8); // hours
  const [end, setEnd] = React.useState(20);

  const monthLabel = new Date(month.y, month.m, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const firstDay = new Date(month.y, month.m, 1).getDay(); // 0=Sun
  const offset = (firstDay + 6) % 7; // 0=Mon
  const daysInMonth = new Date(month.y, month.m+1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 18, maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <div style={{ width: 40, height: 4, background: GREY_400, borderRadius: 2 }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${GREY_BORDER}` }}>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 15, fontWeight: 500 }}>Cancel</button>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: NAVY, fontSize: 15.5 }}>Pick date &amp; time range</div>
          <button onClick={() => onDone(picked, { start, end })} style={{ all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 15, fontWeight: 700 }}>Done</button>
        </div>
        <div style={{ overflow: 'auto', padding: '14px 16px 4px' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={() => setMonth(m => ({ y: m.m === 0 ? m.y-1 : m.y, m: (m.m+11)%12 }))} style={{ all: 'unset', cursor: 'pointer', padding: 8, color: BLUE }}>
              <svg width="10" height="14" viewBox="0 0 11 18"><path d="M9.5 1.5L2 9l7.5 7.5" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{monthLabel}</div>
            <button onClick={() => setMonth(m => ({ y: m.m === 11 ? m.y+1 : m.y, m: (m.m+1)%12 }))} style={{ all: 'unset', cursor: 'pointer', padding: 8, color: BLUE }}>
              <svg width="10" height="14" viewBox="0 0 11 18"><path d="M1.5 1.5L9 9l-7.5 7.5" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: GREY_TEXT, padding: 6 }}>{d}</div>
            ))}
          </div>
          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i}/>;
              const date = new Date(month.y, month.m, d);
              const isPicked = picked && date.getTime() === picked.getTime();
              const isToday = date.getTime() === today.getTime();
              const isPast = date < today && !isToday;
              return (
                <button key={i} disabled={isPast} onClick={() => setPicked(date)} style={{
                  all: 'unset', cursor: isPast ? 'not-allowed' : 'pointer', textAlign: 'center',
                  height: 36, borderRadius: 8, fontSize: 13, fontWeight: isPicked || isToday ? 700 : 500,
                  background: isPicked ? BLUE : (isToday ? BLUE_50 : 'transparent'),
                  color: isPicked ? '#fff' : (isPast ? '#D1D5DB' : (isToday ? BLUE : NAVY)),
                  display: 'grid', placeItems: 'center',
                }}>{d}</button>
              );
            })}
          </div>

          {/* Time range */}
          <div style={{ marginTop: 18, padding: '14px 14px', background: '#FAFAFA', borderRadius: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10 }}>Time range</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: NAVY, fontWeight: 700, fontSize: 14 }}>{String(start).padStart(2,'0')}:00</span>
              <span style={{ color: NAVY, fontWeight: 700, fontSize: 14 }}>{String(end).padStart(2,'0')}:00</span>
            </div>
            <DualSlider min={0} max={23} startVal={start} endVal={end} onChange={(s, e) => { setStart(s); setEnd(e); }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: GREY_TEXT }}>
              <span>00:00</span><span>23:00</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: GREY_TEXT }}>Showing slots <strong style={{ color: NAVY }}>{String(start).padStart(2,'0')}:00 – {String(end).padStart(2,'0')}:00</strong> on {picked.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DualSlider({ min, max, startVal, endVal, onChange }) {
  const trackRef = React.useRef(null);
  const drag = (which) => (e) => {
    e.preventDefault();
    const move = (ev) => {
      const rect = trackRef.current.getBoundingClientRect();
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const v = Math.round(min + pct * (max - min));
      if (which === 'start') onChange(Math.min(v, endVal - 1), endVal);
      else onChange(startVal, Math.max(v, startVal + 1));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  };
  const sPct = ((startVal - min) / (max - min)) * 100;
  const ePct = ((endVal - min) / (max - min)) * 100;
  return (
    <div ref={trackRef} style={{ position: 'relative', height: 28, marginTop: 4 }}>
      <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 4, background: GREY_BORDER, borderRadius: 2 }}/>
      <div style={{ position: 'absolute', top: 12, left: `${sPct}%`, width: `${ePct - sPct}%`, height: 4, background: BLUE, borderRadius: 2 }}/>
      <div onMouseDown={drag('start')} onTouchStart={drag('start')} style={{ position: 'absolute', top: 4, left: `calc(${sPct}% - 10px)`, width: 20, height: 20, borderRadius: 999, background: '#fff', border: `2px solid ${BLUE}`, boxShadow: '0 2px 4px rgba(0,0,0,0.15)', cursor: 'grab' }}/>
      <div onMouseDown={drag('end')} onTouchStart={drag('end')} style={{ position: 'absolute', top: 4, left: `calc(${ePct}% - 10px)`, width: 20, height: 20, borderRadius: 999, background: '#fff', border: `2px solid ${BLUE}`, boxShadow: '0 2px 4px rgba(0,0,0,0.15)', cursor: 'grab' }}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Summary step (review before book)
// ═════════════════════════════════════════════════════════════
function SummaryScreen({ go, state, setState, onClose, persona }) {
  const c = state.clinician || CLINICIANS[0];
  const slot = state.slot || '3:00pm';
  const isB2B = persona === 'b2b';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} title="Review your booking" onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px 16px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Confirm details</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: GREY_TEXT }}>Make sure everything's right before we book this in.</p>

        <SummaryGroup title="Appointment">
          <SummaryRow label="When" value={`Today, ${slot}`} editable onEdit={() => go('appt')}/>
          <SummaryRow label="Type" value="Video call"/>
          <SummaryRow label="Clinician" value={`${c.name} · ${c.role === 'ACP' ? 'ACP' : 'Doctor'}`} editable onEdit={() => go('appt')}/>
        </SummaryGroup>

        <SummaryGroup title="Reason for visit">
          <SummaryRow label="Category" value={state.category || 'Skin'} editable onEdit={() => go('search')}/>
          <SummaryRow label="Concern" value={state.concern || 'Acne'} editable onEdit={() => go('search')}/>
          <SummaryRow label="For" value={state.member || 'Test Demo User'}/>
        </SummaryGroup>

        <div style={{
          background: isB2B ? GREEN_100 : BLUE_50, border: `1px solid ${isB2B ? '#9DDDB6' : BLUE_100}`,
          borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginTop: 16,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: isB2B ? GREEN : BLUE, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {isB2B ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>£</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: GREY_TEXT }}>Total cost</div>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 15, marginTop: 1 }}>
              {isB2B ? <>Free with <span style={{ color: GREEN }}>AXA Health · Plan A</span></> : <>£35.00 charged on confirmation</>}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 16px 28px', flexShrink: 0 }}>
        <PrimaryButton onClick={() => go('confirmed')}>{isB2B ? 'Confirm booking' : 'Pay & confirm — £35'}</PrimaryButton>
      </div>
    </div>
  );
}

function SummaryGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: GREY_TEXT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6, padding: '0 4px' }}>{title}</div>
      <div style={{ background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 10, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, editable, onEdit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${GREY_BORDER}`, gap: 10 }}>
      <div style={{ flex: '0 0 80px', fontSize: 12, color: GREY_TEXT }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13.5, color: NAVY, fontWeight: 600 }}>{value}</div>
      {editable && (
        <button onClick={onEdit} style={{ all: 'unset', cursor: 'pointer', color: BLUE, fontSize: 12, fontWeight: 700 }}>Edit</button>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Confirmed
// ═════════════════════════════════════════════════════════════
function ConfirmedScreen({ go, state, persona }) {
  const c = state.clinician || CLINICIANS[0];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} title="Appointment booked!" tone="green"/>
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: GREEN_100, display: 'grid', placeItems: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={GREEN} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>You're booked</h2>
        <p style={{ textAlign: 'center', margin: '0 0 20px', fontSize: 14, color: GREY_TEXT, lineHeight: 1.5 }}>Today at <strong style={{ color: NAVY }}>{state.slot || '3:00pm'}</strong> with {c.name}. We've sent the details to your inbox.</p>

        <div style={{ background: '#FAFAFA', border: `1px solid ${GREY_BORDER}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <DRow label="Date and time" value={`Today, ${state.slot || '3:00pm'} UK time`}/>
          <DRow label="Appointment type" value="Video"/>
          <DRow label="Clinician" value={c.name}/>
          <DRow label="Category" value={state.category || 'Skin'}/>
          <DRow label="Concern" value={state.concern || 'Acne'} last/>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton onClick={() => {}}>Add to calendar</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function DRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${GREY_BORDER}`, fontSize: 13 }}>
      <span style={{ color: GREY_TEXT }}>{label}</span>
      <span style={{ color: NAVY, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Exit confirm + reminder sheet
// ═════════════════════════════════════════════════════════════
function ExitSheet({ onCancel, onExit, onReminder }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{ background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '20px 18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 40, height: 4, background: GREY_400, borderRadius: 2 }}/>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: NAVY, textAlign: 'center' }}>Leave booking?</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: GREY_TEXT, textAlign: 'center', lineHeight: 1.5 }}>Your appointment isn't booked yet. Want us to remind you to come back later?</p>
        <button onClick={onReminder} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', background: BLUE_50, border: `1.5px solid ${BLUE}`, borderRadius: 12, padding: '14px',
          marginBottom: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: BLUE, display: 'grid', placeItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 9a7 7 0 0114 0c0 7 3 7 3 9H2c0-2 3-2 3-9zM10 21a2 2 0 004 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>Set a reminder</div>
            <div style={{ fontSize: 12, color: GREY_TEXT }}>Pick a time — we'll nudge you</div>
          </div>
          <Chevron color={BLUE}/>
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '13px 0',
            borderRadius: 999, background: '#F4F4F4', color: NAVY, fontWeight: 700, fontSize: 14.5,
          }}>Keep booking</button>
          <button onClick={onExit} style={{
            all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '13px 0',
            borderRadius: 999, background: 'transparent', color: '#D9364C', fontWeight: 700, fontSize: 14.5,
            border: `1px solid ${GREY_BORDER}`,
          }}>Exit anyway</button>
        </div>
      </div>
    </div>
  );
}

function ReminderScreen({ go, state, setState, onClose }) {
  const [when, setWhen] = React.useState('tonight');
  const [howOften, setHowOften] = React.useState('once');
  const opts = [
    { id: 'tonight', label: 'Tonight, 7:00pm', sub: 'In about 4 hours' },
    { id: 'tomorrow', label: 'Tomorrow morning', sub: 'Wed 29 Apr, 8:00am' },
    { id: 'weekend', label: 'This weekend', sub: 'Saturday morning' },
    { id: 'custom', label: 'Pick a date & time', sub: 'Choose your own' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} title="Set a reminder"/>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: BLUE_50, border: `1px solid ${BLUE_100}`, borderRadius: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: BLUE, display: 'grid', placeItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: NAVY, lineHeight: 1.4 }}>
            We'll save your <strong>{state.concern || 'Acne'}</strong> selection so you can resume in a tap.
          </div>
        </div>

        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: NAVY }}>When should we remind you?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {opts.map(o => (
            <button key={o.id} onClick={() => setWhen(o.id)} style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
              gap: 12, padding: '12px 14px',
              background: '#fff', border: `1.5px solid ${when === o.id ? BLUE : GREY_BORDER}`, borderRadius: 10,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                border: when === o.id ? `6px solid ${BLUE}` : `1.5px solid #D1D5DB`,
              }}/>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}>{o.label}</div>
                <div style={{ fontSize: 12, color: GREY_TEXT, marginTop: 1 }}>{o.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: NAVY }}>How should we remind you?</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'push', label: 'Push notification' },
            { id: 'email', label: 'Email' },
            { id: 'sms', label: 'Text' },
          ].map(m => (
            <button key={m.id} onClick={() => setHowOften(m.id)} style={{
              all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center',
              padding: '10px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
              background: howOften === m.id ? BLUE : '#fff',
              color: howOften === m.id ? '#fff' : NAVY,
              border: `1.5px solid ${howOften === m.id ? BLUE : GREY_BORDER}`,
            }}>{m.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '8px 16px 28px', flexShrink: 0 }}>
        <PrimaryButton onClick={() => { setState(s => ({ ...s, reminderSet: true })); go('reminder-done'); }}>Set reminder</PrimaryButton>
      </div>
    </div>
  );
}

function ReminderDoneScreen({ go }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <BookingHeader go={go} title="Reminder set" tone="green"/>
      <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: GREEN_100, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 9a7 7 0 0114 0c0 7 3 7 3 9H2c0-2 3-2 3-9zM10 21a2 2 0 004 0" stroke={GREEN} strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: NAVY }}>We'll remind you tonight</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: GREY_TEXT, lineHeight: 1.5 }}>You'll get a push notification at <strong style={{ color: NAVY }}>7:00pm</strong>. Your selection is saved — picking up where you left off takes one tap.</p>
        <div style={{ width: '100%' }}>
          <PrimaryButton onClick={() => go('home')}>Done</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ApptScreen, SummaryScreen, ConfirmedScreen, ExitSheet, ReminderScreen, ReminderDoneScreen,
  CalendarSheet, CLINICIANS,
});
