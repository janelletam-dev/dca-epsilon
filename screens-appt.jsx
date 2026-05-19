// DCA Booking Journey V2 — Appointment selection + ancillary screens

// Clinicians have a `joined` date and `rating` (out of 5) + reviews count.
// Each clinician has an `availability` pattern: which weekday offsets (0..13) they
// have slots on, and which hours they're free. We derive concrete time slots
// from this.  We also tag each clinician with a `previous` flag so they
// surface higher in the list.
const CLINICIANS = [
  { id: 'a1', name: 'Jane Doe', role: 'ACP', img: 'assets/doc-jane.png', joined: 'June 2025', rating: 4.9, reviews: 120, prevåious: true,
    availDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], hours: [9,10,11,14,15,16,17] },
  { id: 'a2', name: 'Simon Hart', role: 'ACP', img: 'assets/doc-simon.png', joined: 'June 2025', rating: 4.8, reviews: 130, previous: false,
    availDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], hours: [9,10,11,12,14,15,16,17] },
  { id: 'a3', name: 'John Smith', role: 'ACP', img: 'assets/doc-john.png', joined: 'June 2025', rating: 4.8, reviews: 90, previous: false,
    availDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], hours: [9,11,12,14,15,16,17] },
  { id: 'a6', name: 'Sarah Robins', role: 'ACP', img: 'assets/doc-sarah.png', joined: 'June 2025', rating: 4.7, reviews: 100, previous: false,
    availDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], hours: [10,11,12,14,15,16,17] },
  { id: 'd1', name: 'Dr Emma Hughes', role: 'Doctor', img: 'assets/doc-emma.png', joined: 'March 2023', rating: 4.9, reviews: 312, previous: false,
    availDays: [0,1,4,5,7,8,11,12], hours: [11,15,16] },
  { id: 'd2', name: 'Dr Michael Chen', role: 'Doctor', img: 'assets/doc-michael.png', joined: 'November 2024', rating: 4.8, reviews: 178, previous: false,
    availDays: [0,2,3,6,7,9,13], hours: [9,10,16,17] },
  { id: 'd4', name: 'Dr Rachel Adams', role: 'Doctor', img: 'assets/doc-rachel.png', joined: 'September 2024', rating: 4.7, reviews: 142, previous: false,
    availDays: [1,3,5,8,10,12], hours: [14,15,16] },
  { id: 'a5', name: 'Anna Brooks', role: 'ACP', img: 'assets/doc-anna.png', joined: 'July 2025', rating: 4.6, reviews: 64, previous: false,
    availDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], hours: [9,10,11,12,13,14,15,16] },
];

// Build the canonical 14-day window we offer in the carousel, starting from
// the user's real "today" so timeslot availability mirrors wall-clock time.
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const TODAY = startOfDay(new Date());
function buildDays(n = 14) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() + i);
    out.push(d);
  }
  return out;
}
const DAYS = buildDays(14);

// Earliest bookable {h,m} on the current day: now + 15min, rounded up to the
// next 15-minute mark. If that pushes past midnight, day 0 has no slots.
function earliestSlotToday() {
  const now = new Date();
  const earliest = new Date(now.getTime() + 15 * 60 * 1000);
  const rounded = new Date(earliest);
  const m = rounded.getMinutes();
  const add = (15 - (m % 15)) % 15;
  rounded.setMinutes(m + add, 0, 0);
  // If rounding spilled into the next day, signal "no slots today".
  if (rounded.getDate() !== now.getDate() || rounded.getMonth() !== now.getMonth() || rounded.getFullYear() !== now.getFullYear()) {
    return null;
  }
  return { h: rounded.getHours(), m: rounded.getMinutes() };
}

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDayShort(d) { return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function fmtDayLong(d) { return `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function fmtTime12(h, m) {
  // Kept for legacy callers (summary/confirmed). New UI uses 24h.
  const ampm = h >= 12 ? 'pm' : 'am';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2,'0')}${ampm}`;
}
function fmtTime24(h, m) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// All possible 15-min slots across the full 24h day.
function buildAllSlots() {
  const out = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) out.push({ h, m });
  return out;
}
const ALL_SLOTS = buildAllSlots();

// Given a clinician + day-offset, return which {h,m} slots they offer.
// Slots are every 15 minutes across the full 24h day.
function slotsFor(clinician, dayOffset) {
  if (!clinician.availDays.includes(dayOffset)) return [];
  return ALL_SLOTS.map(s => ({ ...s }));
}

// Returns first day-offset that has any matching availability for the filtered
// clinicians — so "Today" / "Earliest" badges land on the right day.
function findEarliestDay(clinicians) {
  for (let i = 0; i < DAYS.length; i++) {
    if (clinicians.some(c => c.availDays.includes(i))) return i;
  }
  return null;
}

// Given a day offset and filtered clinicians, return all unique time slots
// for that day, sorted ascending, with the list of clinicians per slot.
// On day 0 (today), slots before "now + 15min, rounded up to the next 15min"
// are filtered out so users can only book a future slot.
function slotsForDay(clinicians, dayOffset) {
  const map = new Map();
  clinicians.forEach(c => {
    slotsFor(c, dayOffset).forEach(({h, m}) => {
      const key = `${h}:${m}`;
      if (!map.has(key)) map.set(key, { h, m, clinicians: [] });
      map.get(key).clinicians.push(c);
    });
  });
  let slots = [...map.values()].sort((a,b) => a.h - b.h || a.m - b.m);
  if (dayOffset === 0) {
    const earliest = earliestSlotToday();
    if (!earliest) return [];
    slots = slots.filter(s => s.h > earliest.h || (s.h === earliest.h && s.m >= earliest.m));
  }
  return slots;
}

function ClinicianAvatar({ c, size = 36 }) {
  if (c.img) return <img src={c.img + '?v=2'} alt="" style={{ width: size, height: size, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} onError={(e)=>{ e.currentTarget.outerHTML='<div style="width:'+size+'px;height:'+size+'px;border-radius:999px;background:#E8EAED;flex-shrink:0;"></div>'; }}/>;
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

// New clinician card matching the screenshot:
// avatar | name + role + "Joined Doctor Care Anywhere in {joined}" | rating badge | Select button
function ClinicianCard({ c, selected, onSelect, anonymise }) {
  const fullRole = c.role === 'ACP' ? 'Advanced Clinical Practitioner' : 'Doctor (GP)';
  return (
    <div style={{
      background: '#fff', border: `1.5px solid ${selected ? BLUE : GREY_BORDER}`, borderRadius: 12,
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: selected ? `0 0 0 3px ${BLUE_50}` : '0 1px 2px rgba(6,23,49,0.04)',
      transition: 'border-color .12s, box-shadow .12s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {anonymise ? (
          <div style={{ width: 44, height: 44, borderRadius: 999, background: BLUE_100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="4" stroke={BLUE} strokeWidth="2"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ) : <ClinicianAvatar c={c} size={44}/>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 15, letterSpacing: -0.2 }}>
              {anonymise ? `Available ${c.role === 'ACP' ? 'Practitioner' : 'Doctor'}` : c.name}
            </div>
            {c.previous && !anonymise && (
              <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: BLUE_100, color: BLUE, letterSpacing: 0.3 }}>SEEN BEFORE</span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: NAVY, marginTop: 2 }}>{fullRole}</div>
          <div style={{ fontSize: 12, color: GREY_TEXT, marginTop: 2, lineHeight: 1.4 }}>
            Joined Doctor Care Anywhere in {c.joined}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
              borderRadius: 999, background: BLUE_50, color: BLUE, fontWeight: 700, fontSize: 11.5,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {c.rating}/5 ({c.reviews} patient reviews)
            </div>
          </div>
        </div>
      </div>
      <div>
        <button onClick={onSelect} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
          padding: selected ? '8px 18px' : '7px 22px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: `1.5px solid ${selected ? BLUE : YELLOW}`,
          background: selected ? BLUE : '#fff',
          color: selected ? '#fff' : NAVY,
          fontWeight: 700, fontSize: 13,
        }}>
          {selected ? 'Selected' : 'Select'}
          {selected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </div>
    </div>
  );
}

// On-page filter pills row — Figma style: yellow outline, label+value inline.
// Horizontally scrollable: native touch + wheel, plus click-and-drag for mouse/trackpad on web.
function FilterDropdowns({ filters, setFilters, anonymise, category, concern }) {
  const isSkin = (category || 'Skin') === 'Skin';
  const scrollRef = React.useRef(null);
  const dragRef = React.useRef({ active: false, startX: 0, startScroll: 0, moved: false, pid: null });

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return; // touch uses native scroll
    const el = scrollRef.current;
    if (!el) return;
    // Track but DON'T capture the pointer yet — capturing immediately redirects
    // click events to the container instead of the inner pill buttons. We
    // upgrade to a real drag (with pointer capture) only after movement
    // crosses the threshold in onPointerMove.
    dragRef.current = { active: true, captured: false, startX: e.clientX, startScroll: el.scrollLeft, moved: false, pid: e.pointerId };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) {
      if (!dragRef.current.moved) {
        dragRef.current.moved = true;
        // Promote to a real drag now: capture the pointer so the user can
        // continue dragging even if their cursor leaves the row.
        try { el.setPointerCapture(dragRef.current.pid); dragRef.current.captured = true; } catch (_) {}
        el.style.cursor = 'grabbing';
      }
      el.scrollLeft = dragRef.current.startScroll - dx;
    }
  };

  const endDrag = () => {
    if (!dragRef.current.active) return;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = '';
      if (dragRef.current.captured) {
        try { el.releasePointerCapture(dragRef.current.pid); } catch (_) {}
      }
    }
    dragRef.current.active = false;
    dragRef.current.captured = false;
  };

  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      dragRef.current.moved = false;
    }
  };

  return (
    <div ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      className="filter-row" style={{
      display: 'flex', gap: 8, paddingBottom: 4,
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none', msOverflowStyle: 'none',
      cursor: 'grab', userSelect: 'none',
    }}>
      <style>{`.filter-row::-webkit-scrollbar{display:none}`}</style>
      <FilterPill
        sheetTitle="Gender preference"
        value={filters.gender}
        labelFor={(v) => v === 'Any' ? 'Any gender' : `${v}`}
        options={['Any', 'Male', 'Female']}
        onChange={(v)=>setFilters(f=>({...f, gender: v}))}
      />
      <ClinicianTypePill
        value={filters.type}
        recommended="ACP"
        concern={concern || 'Acne'}
        onChange={(v)=>setFilters(f=>({...f, type: v}))}
      />
      <FilterPill
        sheetTitle="Appointment type"
        value={filters.apptType}
        labelFor={(v) => `${v} appointment`}
        options={['Video', 'Phone']}
        disabledOptions={isSkin ? ['Phone'] : []}
        disabledNote={isSkin ? 'Skin needs video' : undefined}
        onChange={(v)=>setFilters(f=>({...f, apptType: v}))}
      />
      <ClinicianSearchPill value={filters.clinicianName} onChange={(v)=>setFilters(f=>({...f, clinicianName: v}))}/>
    </div>
  );
}

function ClinicianSearchPill({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [frame, setFrame] = React.useState(null);
  const btnRef = React.useRef(null);
  const isDefault = !value;
  const listRef = React.useRef(null);

  const openSheet = () => {
    if (!open && btnRef.current) {
      const f = btnRef.current.closest('[data-ios-frame="1"]');
      setFrame(f);
    }
    setQ('');
    setOpen(true);
  };
  const close = () => setOpen(false);

  const ql = q.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!ql) return ALL_CLINICIAN_NAMES;
    return ALL_CLINICIAN_NAMES.filter(n => n.toLowerCase().includes(ql));
  }, [ql]);

  // Group alphabetically
  const grouped = React.useMemo(() => {
    const g = {};
    filtered.forEach(n => {
      let letter = n[0].toUpperCase();
      if (!/[A-Z]/.test(letter)) letter = '#';
      (g[letter] = g[letter] || []).push(n);
    });
    return g;
  }, [filtered]);
  const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];

  const jumpTo = (l) => {
    if (!listRef.current) return;
    const node = listRef.current.querySelector(`[data-letter="${l}"]`);
    if (node) node.scrollIntoView({ behavior: 'auto', block: 'start' });
  };

  const sheet = open && frame ? ReactDOM.createPortal(
    <div style={{
      position: 'absolute', inset: 0, zIndex: 320,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      animation: 'dcaSearchSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    }}>
      <style>{`
        @keyframes dcaSearchSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* Top blue strip with grabber + close + title (matches screenshot) */}
      <div style={{
        background: '#0858FF', paddingTop: 54, paddingBottom: 14,
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 38, height: 4.5, borderRadius: 999, background: 'rgba(255,255,255,0.55)' }}/>
        </div>
      </div>
      {/* White rounded top with title row */}
      <div style={{
        background: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
        marginTop: -22, padding: '14px 16px 8px', position: 'relative', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 36 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: -0.2 }}>Search clinicians</div>
          <button onClick={close} style={{
            all: 'unset', cursor: 'pointer', position: 'absolute', right: 0, top: 0,
            width: 36, height: 36, borderRadius: 999, background: '#EEF1F4',
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M4 4l8 8M12 4l-8 8" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* List with A-Z sidebar */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        <div ref={listRef} style={{
          flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          padding: '6px 18px 100px', boxSizing: 'border-box',
        }}>
          {letters.map(l => {
            const items = grouped[l];
            if (!items || items.length === 0) return null;
            return (
              <div key={l} data-letter={l}>
                <div style={{ fontSize: 15, color: '#9AA3B2', fontWeight: 500, padding: '14px 0 6px' }}>{l}</div>
                {items.map((name, i) => {
                  const selected = value === name;
                  return (
                    <button
                      key={name}
                      onClick={() => { onChange(name); close(); }}
                      style={{
                        all: 'unset', cursor: 'pointer', display: 'block',
                        width: '100%', boxSizing: 'border-box',
                        padding: '14px 4px',
                        borderBottom: i < items.length - 1 ? `1px solid #ECEEF1` : 'none',
                        fontSize: 15.5, color: selected ? BLUE : NAVY, fontWeight: selected ? 700 : 500,
                        letterSpacing: -0.1,
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: GREY_TEXT, fontSize: 13.5 }}>
              No clinicians match "{q}"
            </div>
          )}
        </div>

        {/* A-Z jumper */}
        <div style={{
          position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          padding: '6px 4px', userSelect: 'none',
          fontSize: 11, color: BLUE, fontWeight: 700,
        }}>
          {letters.map(l => (
            <button
              key={l}
              onClick={() => jumpTo(l)}
              style={{
                all: 'unset', cursor: 'pointer', padding: '0 2px',
                color: grouped[l] ? BLUE : '#B5C5EE',
                lineHeight: 1.05,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Floating search field */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 18,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'rgba(244, 245, 248, 0.88)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderRadius: 999,
        boxShadow: '0 6px 18px rgba(6, 23, 49, 0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#5C6675" strokeWidth="2"/>
          <path d="M20 20l-3.5-3.5" stroke="#5C6675" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          style={{
            flex: 1, border: 0, outline: 0, background: 'transparent',
            fontSize: 16, font: 'inherit', color: NAVY,
          }}
        />
        {q ? (
          <button onClick={() => setQ('')} style={{
            all: 'unset', cursor: 'pointer', width: 18, height: 18, borderRadius: 999,
            background: '#C7CCD3', display: 'grid', placeItems: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
          </button>
        ) : (
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <rect x="3.5" y="1" width="7" height="11" rx="3.5" fill="#5C6675"/>
            <path d="M1 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#5C6675" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M7 15v2.5" stroke="#5C6675" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    </div>,
    frame
  ) : null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button ref={btnRef} onClick={openSheet} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 999,
        border: `1px solid ${isDefault ? YELLOW : BLUE}`,
        background: isDefault ? '#fff' : BLUE_50,
        color: isDefault ? NAVY : BLUE, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={isDefault ? NAVY : BLUE} strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke={isDefault ? NAVY : BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
        <span>{value || 'Search clinician by name'}</span>
        {!isDefault && <span onClick={(e)=>{ e.stopPropagation(); onChange(null); }} style={{ marginLeft: 2, color: BLUE, fontWeight: 700 }}>×</span>}
      </button>
      {sheet}
    </div>
  );
}

// A short representative list — not exhaustive A-Z, just a believable
// sample so the search/jumper feels real without being a fake directory.
const ALL_CLINICIAN_NAMES = [
  'Abbey Clavel',
  'Adam Sandler',
  'Alfred Molina',
  'Babak Tafti',
  'Catherine Keener',
  'Daniel Craig',
  'Emma Thompson',
  'Helen Mirren',
  'Jane Doe',
  'John Smith',
  'Maggie Smith',
  'Olivia Colman',
  'Sarah Robins',
  'Simon Hart',
  'Tilda Swinton',
];

function FilterPill({ label, labelFor, value, options, onChange, disabledOptions = [], disabledNote, sheetTitle }) {
  const [open, setOpen] = React.useState(false);
  const [frame, setFrame] = React.useState(null);
  const btnRef = React.useRef(null);
  const isDefault = !value || value === options[0];
  const display = labelFor ? labelFor(value || options[0]) : `${label}: ${value || options[0]}`;
  const current = value || options[0];

  const toggle = () => {
    if (!open && btnRef.current) {
      const f = btnRef.current.closest('[data-ios-frame="1"]');
      setFrame(f);
    }
    setOpen(o => !o);
  };

  const sheet = open && frame ? ReactDOM.createPortal(
    <>
      {/* dim overlay over the device, leaving status bar / header faintly visible */}
      <div onClick={() => setOpen(false)} style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(6,23,49,0.45)',
        animation: 'dcaSheetFade 180ms ease-out',
      }}/>
      {/* bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 301,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 20px 32px',
        boxShadow: '0 -12px 36px rgba(6,23,49,0.18)',
        animation: 'dcaSheetSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <style>{`
          @keyframes dcaSheetSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes dcaSheetFade { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        {/* grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 38, height: 4.5, borderRadius: 999, background: '#D5DBE3' }}/>
        </div>
        {/* title */}
        <div style={{
          textAlign: 'center', fontSize: 17, fontWeight: 700, color: NAVY,
          marginBottom: 22, letterSpacing: -0.2,
        }}>{sheetTitle || label}</div>
        {/* options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' }}>
          {options.map(o => {
            const isDisabled = disabledOptions.includes(o);
            const selected = o === current;
            return (
              <button
                key={o}
                disabled={isDisabled}
                onClick={() => { if (isDisabled) return; onChange(o); setOpen(false); }}
                style={{
                  all: 'unset', cursor: isDisabled ? 'not-allowed' : 'pointer',
                  padding: '11px 22px', borderRadius: 999,
                  border: `1.5px solid ${selected ? BLUE : '#D5DBE3'}`,
                  background: selected ? BLUE_50 : '#fff',
                  color: isDisabled ? GREY_400 : (selected ? BLUE : NAVY),
                  fontWeight: selected ? 700 : 600, fontSize: 14,
                  opacity: isDisabled ? 0.55 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  boxShadow: selected ? `0 0 0 3px ${BLUE_50}` : 'none',
                }}
              >
                {selected && (
                  <svg width="13" height="13" viewBox="0 0 16 16">
                    <path d="M3 8l3.5 3.5L13 5" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span>{o}</span>
                  {isDisabled && disabledNote && <span style={{ fontSize: 10.5, fontWeight: 500, color: GREY_TEXT }}>{disabledNote}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>,
    frame
  ) : null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button ref={btnRef} onClick={toggle} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 999,
        border: `1px solid ${isDefault ? YELLOW : BLUE}`,
        background: isDefault ? '#fff' : BLUE_50,
        color: isDefault ? NAVY : BLUE, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
      }}>
        <span>{display}</span>
        <svg width="10" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1l3.5 3.5L8 1" stroke={isDefault ? NAVY : BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
      {sheet}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Clinician type — dedicated rich sheet
// ───────────────────────────────────────────────────────────────
const CLINICIAN_TYPES = [
  {
    id: 'ACP',
    label: 'ACP clinicians',
    name: 'Advanced Clinical Practitioner',
    can: 'Everyday issues, prescriptions, fit notes, and more.',
    cannot: null,
    detail: 'ACPs are senior clinicians who can diagnose, prescribe, and refer for most everyday concerns — including skin, infections, women\u2019s & men\u2019s health, and minor injuries. They have specialist training in long-term condition management.',
  },
  {
    id: 'Doctors',
    label: 'Doctors',
    name: 'Doctor (GP)',
    can: 'Complex conditions, prescriptions, referrals, and more.',
    cannot: null,
    detail: 'GPs see patients with more complex or longer-term medical needs. Useful when you want a doctor specifically, or when an ACP refers you on.',
  },
  {
    id: 'Mental health practitioners',
    label: 'Mental Health Practitioner',
    name: 'Mental Health Practitioner',
    can: 'Mental health assessment and support.',
    cannot: 'They cannot issue prescriptions or provide ongoing therapy.',
    detail: 'A first-line mental health professional. They can assess your needs, offer guidance, and refer you on for therapy or psychiatric care.',
  },
  {
    id: 'Physiotherapists',
    label: 'Physiotherapist',
    name: 'Physiotherapist',
    can: 'Muscle, joint, and movement issues — exercise plans and recovery.',
    cannot: 'They cannot issue prescriptions or fit notes.',
    detail: 'Physios assess muscle, joint, and movement-related concerns. They can give you a tailored exercise programme and refer you on if imaging or specialist care is needed.',
  },
];

// Short-form copy describing what each clinician type does, as per the
// expanded "See what {type}s do" link beneath the date heading.
const CLINICIAN_TYPE_INFO = {
  ACP: {
    name: 'Advanced Clinical Practitioner',
    linkLabel: 'See what ACPs do',
    sheetTitle: 'Advanced Clinical Practitioner',
    intro: 'Highly experienced clinicians registered with the Nursing and Midwifery Council (NMC) or the Health and Care Professions Council (HCPC).',
    can: [
      "Diagnose and treat most everyday health concerns, including the one you've just selected",
      'Prescribe medication',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support',
    ],
    cannot: [],
  },
  Doctors: {
    name: 'Doctor (GP)',
    linkLabel: 'See what GPs do',
    sheetTitle: 'Doctor (GP)',
    intro: 'Fully qualified, General Medical Council (GMC) doctors.',
    can: [
      'Diagnose and treat complex medical conditions',
      'Prescribe medication',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support',
    ],
    cannot: [],
  },
  'Mental health practitioners': {
    name: 'Mental Health Practitioner',
    linkLabel: 'See what MHPs do',
    sheetTitle: 'Mental Health Practitioner',
    intro: 'Highly experienced clinicians registered with the Nursing and Midwifery Council (NMC).',
    can: [
      'Carry out initial mental health assessment',
      'Support anxiety, stress, low mood, sleep issues',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support',
    ],
    cannot: [
      'Prescribe medication',
      'Provide ongoing therapy',
    ],
  },
  Physiotherapists: {
    name: 'Advanced Physiotherapist',
    linkLabel: 'See what Physios do',
    sheetTitle: 'Advanced Physiotherapist',
    intro: 'Registered with the Health and Care Professions Council (HCPC).',
    can: [
      'Help with muscle, joint, and movement problems',
      'Diagnose musculoskeletal conditions',
      'Issue referrals and fit notes',
      'Provide treatment plans and ongoing support',
    ],
    cannot: [
      'Prescribe medication',
    ],
  },
};

// Inline copy block under the "When would you like..." heading: tells the
// user which clinician type they're booking with for their concern, plus a
// link button to a sheet describing that type. The "best suited" wording is
// reserved for the recommended type; other selections get an "also help" line.
function ClinicianTypeIntro({ type, recommended = 'ACP', concern = 'Acne', onShowInfo, onSwitchToRecommended }) {
  const meta = CLINICIAN_TYPE_INFO[type] || CLINICIAN_TYPE_INFO.ACP;
  const recMeta = CLINICIAN_TYPE_INFO[recommended] || CLINICIAN_TYPE_INFO.ACP;
  const isRecommended = type === recommended;
  const article = /^[aeiou]/i.test(meta.name) ? 'an' : 'a';
  // Pluralised display for the recommended type in the nudge ("Our ACPs ...")
  const recPlural = recommended === 'ACP' ? 'ACPs'
                  : recommended === 'Doctors' ? 'GPs'
                  : recommended === 'Mental health practitioners' ? 'MHPs'
                  : 'Physios';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13.5, color: NAVY, lineHeight: 1.5 }}>
        {isRecommended ? (
          <>You're booking with {article} <strong>{meta.name}</strong>, who is best suited to help with <strong>{concern}</strong>.</>
        ) : (
          <>You've selected {article} <strong>{meta.name}</strong>. Our <strong>{recPlural}</strong> are fully qualified to help with this and may be available sooner.</>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        <button onClick={onShowInfo} style={{
          all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          color: BLUE, fontSize: 13.5, fontWeight: 700,
        }}>
          {meta.linkLabel}
          <svg width="11" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {!isRecommended && onSwitchToRecommended && (
          <button onClick={onSwitchToRecommended} style={{
            all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
            color: BLUE, fontSize: 13.5, fontWeight: 700, textDecoration: 'underline',
          }}>
            View {recPlural === 'ACPs' ? 'ACP' : recPlural === 'GPs' ? 'GP' : recPlural === 'MHPs' ? 'MHP' : 'Physio'} availability
          </button>
        )}
      </div>
    </div>
  );
}

// Bottom-sheet describing the selected clinician type — opened from the
// "See what {type}s do" link.
function ClinicianTypeInfoSheet({ typeId, onClose }) {
  const meta = CLINICIAN_TYPE_INFO[typeId] || CLINICIAN_TYPE_INFO.ACP;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '12px 20px 28px', maxHeight: '88%', overflowY: 'auto',
        animation: 'dcaSheetSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <div style={{ width: 38, height: 4.5, borderRadius: 999, background: '#D5DBE3' }}/>
        </div>
        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 14, letterSpacing: -0.2 }}>
          {meta.sheetTitle}
        </div>
        <div style={{ fontSize: 13.5, color: NAVY, lineHeight: 1.5, marginBottom: 16 }}>
          {meta.intro}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, marginBottom: 8 }}>They can:</div>
        <ul style={{ margin: '0 0 16px', paddingLeft: 18, color: NAVY, fontSize: 13.5, lineHeight: 1.55 }}>
          {meta.can.map((line, i) => <li key={i} style={{ marginBottom: 4 }}>{line}</li>)}
        </ul>
        {meta.cannot && meta.cannot.length > 0 && (
          <>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, marginBottom: 8 }}>They cannot:</div>
            <ul style={{ margin: '0 0 16px', paddingLeft: 18, color: NAVY, fontSize: 13.5, lineHeight: 1.55 }}>
              {meta.cannot.map((line, i) => <li key={i} style={{ marginBottom: 4 }}>{line}</li>)}
            </ul>
          </>
        )}
        <button onClick={onClose} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'block',
          width: '100%', textAlign: 'center', padding: '14px 0', borderRadius: 999,
          background: BLUE, color: '#fff', fontWeight: 700, fontSize: 15, marginTop: 4,
        }}>Got it</button>
      </div>
    </div>
  );
}

function ClinicianTypePill({ value, recommended = 'ACP', concern = 'Acne', onChange }) {
  const [open, setOpen] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);
  const [frame, setFrame] = React.useState(null);
  const btnRef = React.useRef(null);

  const current = value || recommended;
  const currentMeta = CLINICIAN_TYPES.find(t => t.id === current) || CLINICIAN_TYPES[0];
  const recMeta = CLINICIAN_TYPES.find(t => t.id === recommended) || CLINICIAN_TYPES[0];
  const others = CLINICIAN_TYPES.filter(t => t.id !== recommended);
  const display = currentMeta.name;
  const isDefault = current === recommended;

  const openSheet = () => {
    if (!open && btnRef.current) {
      const f = btnRef.current.closest('[data-ios-frame="1"]');
      setFrame(f);
    }
    setShowMore(!isDefault);
    setExpandedId(null);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const sheet = open && frame ? ReactDOM.createPortal(
    <>
      <div onClick={close} style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(6,23,49,0.45)',
        animation: 'dcaSheetFade 180ms ease-out',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 301,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 20px 28px',
        boxShadow: '0 -12px 36px rgba(6,23,49,0.18)',
        maxHeight: '88%', overflowY: 'auto',
        animation: 'dcaSheetSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`
          @keyframes dcaSheetSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes dcaSheetFade { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 38, height: 4.5, borderRadius: 999, background: '#D5DBE3' }}/>
        </div>
        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 18, letterSpacing: -0.2 }}>Clinician type</div>

        <div style={{ fontSize: 13.5, fontWeight: 700, color: BLUE, marginBottom: 8, lineHeight: 1.4 }}>
          Which clinician type would you like to talk to?
        </div>
        <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.5, marginBottom: 14 }}>
          For <strong>{concern}</strong>, we recommend booking an appointment with an <strong>{recMeta.name}</strong> – but you're free to choose any clinician type you prefer.
        </div>

        <ClinicianTypePickerCard
          meta={recMeta}
          recommended
          selected={current === recMeta.id}
          expanded={expandedId === recMeta.id}
          onToggle={() => setExpandedId(id => id === recMeta.id ? null : recMeta.id)}
          onSelect={() => { onChange(recMeta.id); close(); }}
        />

        {!showMore && (
          <button
            onClick={() => setShowMore(true)}
            style={{
              all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              color: BLUE, fontSize: 13.5, fontWeight: 700, marginTop: 14, padding: '4px 0',
            }}
          >
            More clinician types
            <svg width="12" height="7" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {showMore && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {others.map(meta => (
              <ClinicianTypePickerCard
                key={meta.id}
                meta={meta}
                selected={current === meta.id}
                expanded={expandedId === meta.id}
                onToggle={() => setExpandedId(id => id === meta.id ? null : meta.id)}
                onSelect={() => { onChange(meta.id); close(); }}
              />
            ))}
            <button
              onClick={() => setShowMore(false)}
              style={{
                all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                color: BLUE, fontSize: 13.5, fontWeight: 700, marginTop: 4, padding: '4px 0',
              }}
            >
              Show less
              <svg width="12" height="7" viewBox="0 0 10 6" fill="none" style={{ transform: 'rotate(180deg)' }}>
                <path d="M1 1l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </>,
    frame
  ) : null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button ref={btnRef} onClick={openSheet} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 999, maxWidth: 148,
        border: `1px solid ${isDefault ? YELLOW : BLUE}`,
        background: isDefault ? '#fff' : BLUE_50,
        color: isDefault ? NAVY : BLUE, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{display}</span>
        <svg width="10" height="6" viewBox="0 0 9 6" fill="none" style={{ flexShrink: 0 }}><path d="M1 1l3.5 3.5L8 1" stroke={isDefault ? NAVY : BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
      {sheet}
    </div>
  );
}

function ClinicianTypePickerCard({ meta, recommended, selected, expanded, onToggle, onSelect }) {
  return (
    <div style={{
      position: 'relative',
      background: selected ? BLUE_50 : '#fff',
      border: `1.5px solid ${selected ? BLUE : '#E2E5EA'}`,
      borderRadius: 14, padding: '14px 14px 14px',
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -12, left: 12,
          background: BLUE, color: '#fff', fontSize: 11.5, fontWeight: 700,
          padding: '4px 10px 4px 8px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          letterSpacing: 0.1,
        }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5l1.7 4.6 4.8.4-3.7 3.2 1.2 4.7L8 11.9l-4 2.5 1.2-4.7L1.5 6.5l4.8-.4L8 1.5z" fill="#fff"/>
          </svg>
          Recommended
        </div>
      )}
      <div style={{ fontSize: 15.5, fontWeight: 700, color: selected ? BLUE : NAVY, marginBottom: 8, marginTop: recommended ? 4 : 0 }}>
        {meta.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: meta.cannot ? 6 : 8 }}>
        <svg width="15" height="15" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M3 8l3.5 3.5L13 5" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.45 }}>{meta.can}</div>
      </div>
      {meta.cannot && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <svg width="15" height="15" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M4 4l8 8M12 4l-8 8" stroke="#D04545" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.45 }}>{meta.cannot}</div>
        </div>
      )}
      <button onClick={onToggle} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
        color: BLUE, fontSize: 13, fontWeight: 700, padding: '2px 0',
      }}>
        See what they do
        <svg width="11" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}>
          <path d="M1 1l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {expanded && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: GREY_TEXT, lineHeight: 1.5, background: '#fff', border: `1px solid ${GREY_BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
          {meta.detail}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={onSelect}
          disabled={selected}
          style={{
            all: 'unset', cursor: selected ? 'default' : 'pointer',
            padding: selected ? '9px 18px' : '8px 22px', borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            border: `1.5px solid ${selected ? BLUE : YELLOW}`,
            background: selected ? BLUE : '#fff',
            color: selected ? '#fff' : NAVY,
            fontWeight: 700, fontSize: 13.5,
          }}
        >
          {selected ? 'Selected' : 'Select'}
          {selected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l4 4L13 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12l4 4L21 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Plain breadcrumb subtitle under the "Select an appointment" heading.
// e.g. "Test User | Skin, hair and nails – Acne". No "Make changes" link — back button handles it.
function BreadcrumbSubtitle({ member, category, concern }) {
  return (
    <div style={{ fontSize: 13.5, color: NAVY, lineHeight: 1.5, marginBottom: 4 }}>
      {member} | {category} – {concern}
    </div>
  );
}

// Sticky bottom bar — Book now button. When a slot is picked, also shows
// a small confirmation line and a link to pick a specific clinician.
function StickyBookNow({ onClick, summary, onChooseClinician }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: '#fff', borderTop: `1px solid ${GREY_BORDER}`,
      padding: '12px 16px 18px',
      boxShadow: '0 -4px 16px rgba(6,23,49,0.06)',
    }}>
      {summary && (
        <div style={{
          fontSize: 13.5, color: NAVY, marginBottom: 10, paddingLeft: 4,
          letterSpacing: -0.1,
        }}>
          You're booking for <strong style={{ fontWeight: 700 }}>{summary}</strong>
        </div>
      )}
      <PrimaryButton onClick={onClick}>Book now</PrimaryButton>
      {onChooseClinician && (
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 13, color: NAVY }}>
          Would you like to{' '}
          <button onClick={onChooseClinician} style={{
            all: 'unset', cursor: 'pointer',
            color: BLUE, fontWeight: 700, textDecoration: 'underline',
          }}>choose a specific clinician?</button>
        </div>
      )}
    </div>
  );
}

// Transient toast that sits just above the sticky Book now bar.
function ApptToast({ message }) {
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 70,
      background: NAVY, color: '#fff',
      borderRadius: 12, padding: '12px 14px',
      fontSize: 13.5, fontWeight: 600, lineHeight: 1.4,
      boxShadow: '0 8px 24px rgba(6,23,49,0.28)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'dcaToastIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    }}>
      <style>{`@keyframes dcaToastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
        <path d="M12 7v6M12 16.5v.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <span>{message}</span>
    </div>
  );
}

// Subtle "Availability updated · just now" line shown below the clinician list.
// Re-renders on the parent's 5s tick — relative-time text is computed each render.
function AvailabilityUpdatedLine({ ts }) {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  let label;
  if (diffSec < 5) label = 'just now';
  else if (diffSec < 60) label = `${diffSec}s ago`;
  else if (diffSec < 3600) label = `${Math.floor(diffSec / 60)}m ago`;
  else label = `${Math.floor(diffSec / 3600)}h ago`;
  const isFresh = diffSec < 5;
  return (
    <div style={{
      marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontSize: 11.5, color: GREY_TEXT, fontWeight: 500,
      animation: isFresh ? 'dcaUpdatedFlash 600ms ease-out' : undefined,
    }}>
      <style>{`@keyframes dcaUpdatedFlash { from { opacity: 0.4; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: isFresh ? GREEN : '#C7CCD3', flexShrink: 0,
      }}/>
      <span>Availability updated · {label}</span>
    </div>
  );
}

// Bottom-sheet for picking a specific clinician. Opens from the "choose a
// specific clinician?" link under Book now. Shows up to 4 clinicians with no
// pre-selection — user must actively pick before "Book now" is enabled.
function MeetClinicianSheet({ clinicians, initialPickedId, onSelect, onClose, onBook, anonymise }) {
  // Pre-select the first available clinician if no initial pick was passed in.
  const [pickedId, setPickedId] = React.useState(
    initialPickedId || (clinicians[0] && clinicians[0].id) || null
  );
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState(() => Date.now());
  const [, forceTick] = React.useState(0);

  React.useEffect(() => {
    const refresh = setInterval(() => setLastUpdatedAt(Date.now()), 30000);
    const tick = setInterval(() => forceTick(n => n + 1), 5000);
    return () => { clearInterval(refresh); clearInterval(tick); };
  }, []);

  // If we auto-pre-selected the first clinician on mount, push that selection
  // up so the parent state mirrors what's shown selected in the sheet.
  React.useEffect(() => {
    if (!initialPickedId && clinicians[0]) onSelect(clinicians[0]);
    // eslint-disable-next-line
  }, []);

  const visible = clinicians.slice(0, 4);

  const handleSelect = (c) => {
    setPickedId(c.id);
    onSelect(c);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 18, maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <div style={{ width: 80, height: 4, background: 'rgba(3, 7, 18, 0.1)', borderRadius: 999 }}/>
        </div>
        <div style={{ padding: '14px 16px 8px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, letterSpacing: -0.1 }}>Meet your clinician</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: GREY_TEXT, fontSize: 13 }}>
              No clinicians match the current preferences.
            </div>
          ) : (
            <>
              {visible.map((c, i) => (
                <React.Fragment key={c.id}>
                  <ClinicianCard
                    c={c}
                    selected={c.id === pickedId}
                    onSelect={() => handleSelect(c)}
                    anonymise={anonymise}
                  />
                  {i === 0 && visible.length > 1 && (
                    <div aria-hidden="true" style={{
                      height: 1, background: GREY_BORDER,
                      margin: '4px 8px',
                    }}/>
                  )}
                </React.Fragment>
              ))}
              <AvailabilityUpdatedLine ts={lastUpdatedAt}/>
            </>
          )}
        </div>
        {visible.length > 0 && (
          <div style={{ borderTop: `1px solid ${GREY_BORDER}`, padding: '12px 16px 4px', background: '#fff' }}>
            <PrimaryButton onClick={onBook} disabled={!pickedId}>Book now</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ApptScreen({ go, state, setState, onClose, anonymise, errorMode = 'none' }) {
  const [filters, setFilters] = React.useState({ type: 'ACP', apptType: 'Video', gender: 'Any', clinicianName: null });
  const [dayIdx, setDayIdx] = React.useState(0);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showClinicianSheet, setShowClinicianSheet] = React.useState(false);
  const [showTypeInfo, setShowTypeInfo] = React.useState(false);
  // True once the user actively picks a clinician via the sheet (vs. the
  // default auto-assigned on slot pick). Drives the "with {name}" indicator.
  const [clinicianConfirmed, setClinicianConfirmed] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const filtersActive = (filters.type !== 'ACP') || (filters.apptType !== 'Video') || (filters.gender !== 'Any') || !!filters.clinicianName;

  React.useEffect(() => { if (filtersActive) setShowFilters(true); }, [filtersActive]);

  const filtered = React.useMemo(() => {
    let list = [...CLINICIANS];
    if (filters.type === 'ACP') list = list.filter(c => c.role === 'ACP');
    if (filters.type === 'Doctors') list = list.filter(c => c.role === 'Doctor');
    if (filters.type === 'Mental health practitioners' || filters.type === 'Physiotherapists') list = [];
    if (filters.clinicianName) list = list.filter(c => c.name === filters.clinicianName);
    return list;
  }, [filters]);

  const slotsToday = React.useMemo(() => slotsForDay(filtered, dayIdx), [filtered, dayIdx]);
  const dayHasSlots = (offset) => filtered.some(c => c.availDays.includes(offset));

  React.useEffect(() => {
    if (state.selectedSlot && !state.selectedSlot.startsWith(`d${dayIdx}|`)) {
      setState(s => ({ ...s, selectedSlot: null, slot: null, clinician: null }));
    }
  }, [dayIdx]); // eslint-disable-line

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const onSelectSlot = (slotObj) => {
    const c = slotObj.clinicians[0];
    const key = `d${dayIdx}|${slotObj.h}:${slotObj.m}`;
    const label = fmtTime24(slotObj.h, slotObj.m);
    setState(s => ({
      ...s,
      selectedSlot: key,
      slot: label,
      clinician: c,
      pickedDate: DAYS[dayIdx],
      pickedSlotHour: slotObj.h,
      pickedSlotMin: slotObj.m,
      slotClinicianPool: slotObj.clinicians.map(cc => cc.id),
    }));
    setClinicianConfirmed(false);
  };

  const onBookNow = () => {
    if (errorMode !== 'none') {
      setToast("No slots available — try changing the date or set a reminder.");
      return;
    }
    if (!state.selectedSlot) {
      setToast("Please pick a time slot to continue.");
      return;
    }
    go('confirmed');
  };

  // Header back arrow: if a slot is already picked, just clear it and keep the
  // user on the screen so they can re-pick. Otherwise behave like normal back.
  const smartGo = (next) => {
    if (state.selectedSlot) {
      setState(s => ({ ...s, selectedSlot: null, slot: null, clinician: null }));
      return;
    }
    go(next);
  };

  const selectedKey = state.selectedSlot;
  const slotIsForToday = selectedKey && selectedKey.startsWith(`d${dayIdx}|`);

  // Full roster matching the current preferences (type, gender, name).
  // Drives the "choose a specific clinician" sheet — the slot is already
  // locked in; this lets the user pick from any available clinician.
  const sheetClinicians = filtered;

  const clinicianRoleLabel = filters.type === 'Doctors' ? 'Doctor' : filters.type === 'ACP' ? 'Advanced Clinical Practitioner' : filters.type;
  const concernLabel = state.concern || 'Acne';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F9FCFF', position: 'relative' }}>
      <BookingHeader go={smartGo} onClose={onClose}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 14px 110px', background: '#F9FCFF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: -0.3 }}>Select an appointment</h2>
            <BreadcrumbSubtitle
              member={state.member}
              category={state.category || 'Skin, hair and nails'}
              concern={concernLabel}
            />
          </div>
          <button onClick={() => setShowFilters(v => !v)} aria-label="Appointment preferences" aria-expanded={showFilters} style={{
            all: 'unset', cursor: 'pointer', flexShrink: 0,
            width: 38, height: 38, borderRadius: 999,
            border: `1px solid ${(showFilters || filtersActive) ? BLUE : YELLOW}`,
            background: (showFilters || filtersActive) ? BLUE_50 : '#fff',
            opacity: (showFilters || filtersActive) ? 1 : 0.6,
            display: 'grid', placeItems: 'center', position: 'relative', marginTop: 4,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke={(showFilters || filtersActive) ? BLUE : NAVY} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {filtersActive && !showFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 999, background: BLUE, border: '1.5px solid #fff' }}/>}
          </button>
        </div>

        {showFilters && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 10 }}>Clinician or appointment preferences</div>
            <FilterDropdowns filters={filters} setFilters={setFilters} category={state.category} concern={state.concern}/>
          </div>
        )}

        {/* Date section — always visible; user proceeds via Book now after picking a slot. */}
        {(
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 8 }}>When would you like your appointment?</div>
            <ClinicianTypeIntro
              type={filters.type}
              recommended="ACP"
              concern={concernLabel}
              onShowInfo={() => setShowTypeInfo(true)}
              onSwitchToRecommended={() => setFilters(f => ({ ...f, type: 'ACP' }))}
            />
            <DateCarousel days={DAYS} dayIdx={dayIdx} setDayIdx={setDayIdx} dayHasSlots={dayHasSlots} onPickCalendar={() => setShowCalendar(true)}/>

            <div style={{ marginTop: 14 }}>
              {errorMode === 'noslots' ? (
                <EmptyStateCard go={go} onSetReminder={() => go('reminder')}/>
              ) : errorMode === 'fewhours' ? (
                <FewHoursCard onSetReminder={() => go('reminder')} onPickDate={() => setShowCalendar(true)} setFilters={setFilters}/>
              ) : slotsToday.length === 0 ? (
                <NoSlotsForDay dayLabel={fmtDayLong(DAYS[dayIdx])} onSetReminder={() => go('reminder')}/>
              ) : (
                <TimeGrid slots={slotsToday} selectedKey={slotIsForToday ? `${state.pickedSlotHour}:${state.pickedSlotMin}` : null} onSelect={onSelectSlot}/>
              )}
            </div>
          </div>
        )}

      </div>

      <StickyBookNow
        onClick={onBookNow}
        summary={slotIsForToday && state.slot ? `${fmtDayShort(DAYS[dayIdx])} at ${state.slot}${clinicianConfirmed && state.clinician ? ` with ${anonymise ? `your ${state.clinician.role === 'ACP' ? 'ACP' : 'Doctor'}` : state.clinician.name}` : ''}` : null}
        onChooseClinician={slotIsForToday && sheetClinicians.length > 0 ? () => setShowClinicianSheet(true) : null}
      />
      {toast && <ApptToast message={toast}/>}

      {showCalendar && <CalendarSheet onClose={() => setShowCalendar(false)} onDone={(date, range) => { setState(s => ({ ...s, customDate: date, customRange: range })); setShowCalendar(false); }}/>}

      {showTypeInfo && (
        <ClinicianTypeInfoSheet typeId={filters.type} onClose={() => setShowTypeInfo(false)}/>
      )}

      {showClinicianSheet && (
        <MeetClinicianSheet
          clinicians={sheetClinicians}
          initialPickedId={clinicianConfirmed ? state.clinician?.id : null}
          anonymise={anonymise}
          onSelect={(c) => { setState(s => ({ ...s, clinician: c })); setClinicianConfirmed(true); }}
          onBook={() => { setClinicianConfirmed(true); setShowClinicianSheet(false); onBookNow(); }}
          onClose={() => setShowClinicianSheet(false)}
        />
      )}
    </div>
  );
}

// ─── Date carousel ─ Figma style: 3 visible at a time, yellow circular chevrons ─
function DateCarousel({ days, dayIdx, setDayIdx, dayHasSlots, onPickCalendar }) {
  const scrollerRef = React.useRef(null);
  const itemRefs = React.useRef([]);
  // Snap-scroll: 3 visible at a time. Compute step from item width.
  const scrollByItems = (dir) => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const item = itemRefs.current[0];
    const step = item ? (item.offsetWidth + 8) * 3 : 240;
    sc.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // Keep the selected date in view
  React.useEffect(() => {
    const el = itemRefs.current[dayIdx];
    if (el && el.scrollIntoView) {
      const sc = scrollerRef.current;
      if (sc) {
        const r = el.getBoundingClientRect();
        const sr = sc.getBoundingClientRect();
        if (r.left < sr.left || r.right > sr.right) {
          sc.scrollTo({ left: el.offsetLeft - 8, behavior: 'smooth' });
        }
      }
    }
  }, [dayIdx]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={() => scrollByItems(-1)} aria-label="Earlier dates" style={{
        all: 'unset', cursor: 'pointer', flexShrink: 0,
        width: 30, height: 30, borderRadius: 999, border: `1px solid ${YELLOW}`,
        display: 'grid', placeItems: 'center', background: '#fff', opacity: 0.5,
      }}>
        <svg width="7" height="11" viewBox="0 0 8 14" fill="none"><path d="M6 1L1 7l5 6" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div ref={scrollerRef} className="date-scroller" style={{
        flex: 1, display: 'flex', gap: 8, overflowX: 'auto',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
        padding: '2px 0', scrollSnapType: 'x mandatory',
      }}>
        <style>{`.date-scroller::-webkit-scrollbar{display:none}`}</style>
        {days.map((d, i) => {
          const isSelected = i === dayIdx;
          const hasSlots = dayHasSlots(i);
          const label = `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
          return (
            <button key={i} ref={(el) => itemRefs.current[i] = el} onClick={() => hasSlots && setDayIdx(i)} disabled={!hasSlots} style={{
              all: 'unset', cursor: hasSlots ? 'pointer' : 'not-allowed', boxSizing: 'border-box',
              flex: '0 0 calc((100% - 16px) / 3)', textAlign: 'center',
              padding: '10px 8px', borderRadius: 999,
              border: `1.5px solid ${isSelected ? BLUE : '#D7DCE3'}`,
              background: isSelected ? BLUE_50 : '#fff',
              color: isSelected ? BLUE : (hasSlots ? NAVY : GREY_400),
              fontWeight: isSelected ? 700 : 500, fontSize: 13,
              whiteSpace: 'nowrap', scrollSnapAlign: 'start',
              opacity: hasSlots ? 1 : 0.5,
            }}>{label}</button>
          );
        })}
      </div>
      <button onClick={() => scrollByItems(1)} aria-label="Later dates" style={{
        all: 'unset', cursor: 'pointer', flexShrink: 0,
        width: 30, height: 30, borderRadius: 999, border: `1px solid ${YELLOW}`,
        display: 'grid', placeItems: 'center', background: '#fff',
      }}>
        <svg width="7" height="11" viewBox="0 0 8 14" fill="none"><path d="M2 1l5 6-5 6" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// ─── Time grid ─ 4 cols, 24h labels — fills available height in parent scroller ─
function TimeGrid({ slots, selectedKey, onSelect }) {
  return (
    <div style={{ marginTop: 14, position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {slots.map(s => {
          const key = `${s.h}:${s.m}`;
          const isSelected = key === selectedKey;
          return (
            <button key={key} onClick={() => onSelect(s)} style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box', textAlign: 'center',
              padding: '12px 0', borderRadius: 8,
              border: `1.5px solid ${isSelected ? BLUE : '#D7DCE3'}`,
              background: isSelected ? BLUE_50 : '#fff',
              color: isSelected ? BLUE : NAVY,
              fontWeight: isSelected ? 700 : 500, fontSize: 14,
            }}>{fmtTime24(s.h, s.m)}</button>
          );
        })}
      </div>
    </div>
  );
}

function NoSlotsForDay({ dayLabel, onSetReminder }) {
  return (
    <div style={{ background: '#fff', border: `1px dashed ${GREY_BORDER}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: NAVY, fontWeight: 700, marginBottom: 4 }}>No slots on {dayLabel}</div>
      <div style={{ fontSize: 12.5, color: GREY_TEXT, marginBottom: 12, lineHeight: 1.5 }}>Try a different day above, or we'll let you know when something opens up.</div>
      <button onClick={onSetReminder} style={{
        all: 'unset', cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
        background: BLUE_50, color: BLUE, fontWeight: 700, fontSize: 12.5,
      }}>Set a reminder</button>
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
          <div style={{ width: 80, height: 4, background: 'rgba(3, 7, 18, 0.1)', borderRadius: 999 }}/>
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
// Confirmed
// ═════════════════════════════════════════════════════════════
function ConfirmedScreen({ go, state, persona }) {
  const c = state.clinician || CLINICIANS[0];
  const firstName = c.first || (c.name ? c.name.split(' ')[0] : 'your clinician');
  // Every clinician renders as "Advanced Clinician" in the prototype.
  const roleLabel = 'Advanced Clinician';
  const [aboutOpen, setAboutOpen] = React.useState(false);

  // Resolve the booked slot into relative + full-date labels.
  const ss = state.selectedSlot;
  let slotTime = state.slot || '08:00';
  let relativeLabel = 'Today';
  if (ss && typeof BOOKING_NOW !== 'undefined') {
    const tStart = new Date(BOOKING_NOW); tStart.setHours(0, 0, 0, 0);
    const currentDay = addDays(tStart, ss.day);
    const band = TIME_BANDS.find((b) => b.id === ss.band) || TIME_BANDS[0];
    const sd = slotDate(currentDay, band, ss.h, ss.m);
    slotTime = fmtTime(ss.h, ss.m);
    const idxFromToday = dayDiff(sd, tStart);
    if (idxFromToday === 0) relativeLabel = 'Today';
    else if (idxFromToday === 1) relativeLabel = 'Tomorrow';
    else if (idxFromToday > 1 && idxFromToday <= 6) relativeLabel = `In ${idxFromToday} days`;
    else relativeLabel = `${DAYS_SHORT[sd.getDay()]} ${sd.getDate()} ${MONTHS_SHORT[sd.getMonth()]}`;
  }

  // "Done" returns to home; the booking stays in state so the home tile renders.
  const onDone = () => go('home');

  return (
    <div data-dca-theme="dca" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(192.04deg, var(--dca-tint) 0%, #FFFFFF 50%, var(--dca-tint) 100%)'
    }}>
      <BookingHeader go={go} title="Appointment booked" tone="green" onClose={onDone}/>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, padding: '16px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          {/* Check circle — matches Figma spec: 48px, 1px #0041CC border, blue check */}
          <div style={{
            width: 48, height: 48, borderRadius: 9999,
            border: '1px solid #0041CC',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5l5 5L20 6.5" stroke="#0041CC" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Heading */}
          <div style={{
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 18, lineHeight: '28px',
            color: '#030712', textAlign: 'center', width: '100%',
          }}>Get ready for your appointment</div>

          {/* Summary card — blue-outlined pill of facts */}
          <div style={{
            boxSizing: 'border-box', width: '100%',
            padding: '12px 24px',
            background: '#FFFFFF', border: '2px solid #135CFF', borderRadius: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: '100%', display: 'flex', flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#133595' }}>
                {relativeLabel}
              </div>
              <div style={{ width: 1, height: 16, background: '#D7E9FF' }}/>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#133595' }}>
                {slotTime}
              </div>
              <div style={{ width: 1, height: 16, background: '#D7E9FF' }}/>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#133595' }}>
                {state.apptKind === 'phone' ? 'Phone' : 'Video'}
              </div>
            </div>
            <div style={{ width: '100%', height: 1, background: '#D7E9FF' }}/>
            <div style={{
              width: '100%', textAlign: 'center',
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#133595',
            }}>
              {(state.category || 'Skin, hair, and nails')} • {(state.concern || 'Acne')}
            </div>
          </div>

          {/* Clinician card */}
          <div style={{
            boxSizing: 'border-box', width: '100%', padding: 24,
            background: '#FFFFFF', border: '1px solid #D7E9FF', borderRadius: 16,
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <ClinicianAvatar c={c} size={48}/>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '19px', color: '#1B1B1A' }}>{c.name}</div>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 14, lineHeight: '16px', color: '#414245' }}>{roleLabel}</div>
                <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
                  Joined Doctor Care Anywhere in {c.joined || 'June 2025'}
                </div>
                {typeof c.rating !== 'undefined' && (
                  <RatingBadge rating={c.rating} reviews={c.reviews} />
                )}
              </div>
            </div>

            {/* "About {name}" disclosure — tap to expand the bio inline.
                Bio only carries through for the recommended pick (Jane /
                Simon); for others the disclosure is hidden. */}
            {c.bio && (
              <>
                <button
                  onClick={() => setAboutOpen((v) => !v)}
                  aria-expanded={aboutOpen}
                  aria-label={`About ${firstName}`}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
                    fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
                    color: '#135CFF',
                  }}>
                  About {firstName}
                  <ChevronToggle open={aboutOpen} size={16} />
                </button>
                {aboutOpen && (
                  <div style={{
                    fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '18px',
                    color: '#414245',
                  }}>{c.bio}</div>
                )}
              </>
            )}
          </div>

          {/* Upload files card */}
          <div style={{
            boxSizing: 'border-box', width: '100%', padding: 24,
            background: '#FFFFFF', border: '1px solid #D7E9FF', borderRadius: 16,
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 10px 15px -3px rgba(15,55,190,0.05), 0 4px 6px -4px rgba(15,55,190,0.05)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>Upload files</div>
              <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
                Provide the clinician with relevant photos, videos, or test results for inspection.
              </div>
            </div>

            <button
              style={{
                all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 8, padding: '12px 16px', width: '100%', height: 40,
                background: '#A2C4FF', borderRadius: 9999,
                boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
                fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#133595',
              }}>
              Upload files
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v9M4 6l4-4 4 4M3 13.5h10" stroke="#133595" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Sticky footer — Add to calendar + Done */}
        <div style={{
          position: 'sticky', bottom: 0, flexShrink: 0,
          padding: '16px 24px 36px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <button
            style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 8, padding: '12px 16px', width: '100%', height: 40,
              background: '#135CFF', borderRadius: 9999,
              boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#EDF6FF',
            }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#EDF6FF" strokeWidth="1.33"/>
              <path d="M2 6.5h12M5.5 1.5V4M10.5 1.5V4" stroke="#EDF6FF" strokeWidth="1.33" strokeLinecap="round"/>
            </svg>
            Add to calendar
          </button>

          <button
            onClick={onDone}
            style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 8, padding: '12px 16px', width: '100%', height: 40,
              background: '#FFFFFF', border: '1px solid #FFB306', borderRadius: 9999,
              boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
              fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#030712',
            }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetYourClinician({ c }) {
  const namePrefix = c.role === 'ACP' ? 'Dr.' : 'Dr.';
  const role = c.role === 'ACP' ? 'Advanced Clinical Practitioner'
    : c.role === 'Doctor' ? 'Doctor (GP)'
    : c.role === 'Mental health practitioners' ? 'Mental Health Practitioner'
    : c.role === 'Physiotherapists' ? 'Physiotherapist'
    : c.role || 'Clinician';
  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${BLUE_200}`,
      borderRadius: 16,
      padding: '20px 22px 22px',
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 18, letterSpacing: -0.2 }}>
        Meet your clinician
      </div>
      <div style={{ marginBottom: 14 }}>
        {c.img ? (
          <img src={c.img} alt={c.name} style={{
            width: 64, height: 64, borderRadius: 999, objectFit: 'cover',
            background: '#F0F2F5',
          }}/>
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: 999, background: BLUE_100,
            display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, color: BLUE,
          }}>
            {c.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
          </div>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: -0.1 }}>
        {namePrefix} {c.name}
      </div>
      <div style={{ fontSize: 14, color: NAVY, marginBottom: 4 }}>
        {role}
      </div>
      <div style={{ fontSize: 13.5, color: GREY_TEXT, marginBottom: 12 }}>
        Joined Doctor Care Anywhere in {c.joined || 'June 2025'}
      </div>
      {c.rating && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 999,
          background: BLUE, color: '#fff', fontWeight: 700, fontSize: 13,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#fff"/>
            <path d="M5 8.2l2 2 4-4.2" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          {c.rating}/5 ({c.reviews || 100} patient reviews)
        </div>
      )}
    </div>
  );
}

function AddToCalendarButton({ state, clinician }) {
  const [open, setOpen] = React.useState(false);
  const [frame, setFrame] = React.useState(null);
  const btnRef = React.useRef(null);

  const openSheet = () => {
    if (btnRef.current) {
      const f = btnRef.current.closest('[data-ios-frame="1"]');
      setFrame(f);
    }
    setOpen(true);
  };
  const close = () => setOpen(false);

  const sheet = open && frame ? ReactDOM.createPortal(
    <>
      <div onClick={close} style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(6,23,49,0.45)',
        animation: 'dcaSheetFade 180ms ease-out',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 301,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 20px 28px',
        boxShadow: '0 -12px 36px rgba(6,23,49,0.18)',
        animation: 'dcaSheetSlide 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 38, height: 4.5, borderRadius: 999, background: '#D5DBE3' }}/>
        </div>
        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 6, letterSpacing: -0.2 }}>Add to calendar</div>
        <div style={{ textAlign: 'center', fontSize: 13, color: GREY_TEXT, marginBottom: 18, lineHeight: 1.5 }}>
          {state.slot || '15:00'} today with {clinician.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'apple', label: 'Apple Calendar' },
            { id: 'google', label: 'Google Calendar' },
            { id: 'outlook', label: 'Outlook' },
            { id: 'ics', label: 'Download .ics file' },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => close()}
              style={{
                all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 14px', border: `1px solid ${GREY_BORDER}`, borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: NAVY,
              }}
            >
              <CalendarLogoIcon kind={o.id}/>
              <span style={{ flex: 1 }}>{o.label}</span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1l6 6-6 6" stroke="#9AA3B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>,
    frame
  ) : null;

  return (
    <>
      <button ref={btnRef} onClick={openSheet} style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
        flex: 1, padding: '13px 20px', borderRadius: 999,
        border: `1.5px solid ${BLUE}`, color: BLUE,
        fontWeight: 700, fontSize: 14, textAlign: 'center',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: '#fff',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="3" stroke={BLUE} strokeWidth="1.8"/>
          <path d="M3 9h18M8 3v4M16 3v4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Add to calendar
      </button>
      {sheet}
    </>
  );
}

function CalendarLogoIcon({ kind }) {
  const sz = 28;
  if (kind === 'apple') {
    return (
      <div style={{ width: sz, height: sz, borderRadius: 7, background: '#fff', border: `1px solid ${GREY_BORDER}`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 7, fontWeight: 700, color: '#FF3B30', lineHeight: 1, letterSpacing: 0.4, textTransform: 'uppercase', paddingTop: 3 }}>WED</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1, marginTop: -2, marginBottom: 4 }}>17</div>
      </div>
    );
  }
  if (kind === 'google') {
    return (
      <div style={{ width: sz, height: sz, borderRadius: 7, background: '#fff', border: `1px solid ${GREY_BORDER}`, display: 'grid', placeItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#4285F4', fontFamily: 'system-ui' }}>17</div>
      </div>
    );
  }
  if (kind === 'outlook') {
    return (
      <div style={{ width: sz, height: sz, borderRadius: 7, background: '#0072C6', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>O</div>
    );
  }
  return (
    <div style={{ width: sz, height: sz, borderRadius: 7, background: GREY_BG, display: 'grid', placeItems: 'center' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          <div style={{ width: 80, height: 4, background: 'rgba(3, 7, 18, 0.1)', borderRadius: 999 }}/>
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

// ═════════════════════════════════════════════════════════════
// "Meet your clinician" — full-page picker after the time-of-day
// loading state. Recommended Jane on top, "Other clinicians"
// collapsible (Simon), and a fallback section with −15/+15 min
// time-shift options (John, Sarah). Single-select across all
// sections; sticky footer label tracks the chosen clinician.
// ═════════════════════════════════════════════════════════════
function MeetClinicianScreen({ go, state, setState, onClose }) {
  // Demo data tracks the gender filter the user set on the time-of-day
  // screen. Ratings are intentionally Figma-exact (recommended 4.6, other
  // 4.5, fallbacks higher) so the trade-off UI is visible in every variant.
  const gender = state?.gender === 'male' ? 'male'
    : state?.gender === 'female' ? 'female'
    : 'any';

  const RECOMMENDED_BY_GENDER = {
    any: {
      id: 'rec-jane', first: 'Jane', name: 'Jane Doe',
      role: 'ACP', img: 'assets/doc-jane.png',
      joined: 'June 2025', rating: 4.6, reviews: 120,
      bio: 'Jane has over a decade of experience supporting patients with skin concerns. She focuses on practical, evidence-based advice and shared decision-making.',
    },
    female: {
      id: 'rec-jane', first: 'Jane', name: 'Jane Doe',
      role: 'ACP', img: 'assets/doc-jane.png',
      joined: 'June 2025', rating: 4.6, reviews: 120,
      bio: 'Jane has over a decade of experience supporting patients with skin concerns. She focuses on practical, evidence-based advice and shared decision-making.',
    },
    male: {
      id: 'rec-simon', first: 'Simon', name: 'Simon Hart',
      role: 'ACP', img: 'assets/doc-simon.png',
      joined: 'January 2023', rating: 4.6, reviews: 120,
      bio: 'Simon has over a decade of experience supporting patients with skin concerns. He focuses on practical, evidence-based advice and shared decision-making.',
    },
  };

  const OTHERS_BY_GENDER = {
    any: [{
      id: 'oth-simon', first: 'Simon', name: 'Simon Hart',
      role: 'ACP', img: 'assets/doc-simon.png',
      joined: 'January 2023', rating: 4.5, reviews: 130,
    }],
    female: [{
      id: 'oth-sarah', first: 'Sarah', name: 'Sarah Robins',
      role: 'ACP', img: 'assets/doc-sarah.png',
      joined: 'June 2025', rating: 4.5, reviews: 130,
    }],
    male: [{
      id: 'oth-john', first: 'John', name: 'John Smith',
      role: 'ACP', img: 'assets/doc-john.png',
      joined: 'October 2024', rating: 4.5, reviews: 130,
    }],
  };

  const FALLBACKS_BY_GENDER = {
    any: {
      before: {
        id: 'fb-john', first: 'John', name: 'John Smith',
        role: 'ACP', img: 'assets/doc-john.png',
        joined: 'October 2024', rating: 4.8, reviews: 90,
      },
      after: {
        id: 'fb-sarah', first: 'Sarah', name: 'Sarah Robins',
        role: 'ACP', img: 'assets/doc-sarah.png',
        joined: 'June 2025', rating: 4.7, reviews: 100,
      },
    },
    female: {
      before: {
        id: 'fb-emma', first: 'Emma', name: 'Emma Hughes',
        role: 'ACP', img: 'assets/doc-emma.png',
        joined: 'March 2023', rating: 4.8, reviews: 90,
      },
      after: {
        id: 'fb-rachel', first: 'Rachel', name: 'Rachel Adams',
        role: 'ACP', img: 'assets/doc-rachel.png',
        joined: 'September 2024', rating: 4.7, reviews: 100,
      },
    },
    male: {
      before: {
        id: 'fb-michael', first: 'Michael', name: 'Michael Chen',
        role: 'ACP', img: 'assets/doc-michael.png',
        joined: 'November 2024', rating: 4.8, reviews: 90,
      },
      after: {
        id: 'fb-john', first: 'John', name: 'John Smith',
        role: 'ACP', img: 'assets/doc-john.png',
        joined: 'October 2024', rating: 4.7, reviews: 100,
      },
    },
  };

  const recommended = RECOMMENDED_BY_GENDER[gender];
  const otherClinicians = OTHERS_BY_GENDER[gender];
  const fallbackBefore = FALLBACKS_BY_GENDER[gender].before;
  const fallbackAfter = FALLBACKS_BY_GENDER[gender].after;

  const allClinicians = [recommended, ...otherClinicians, fallbackBefore, fallbackAfter];

  const [selectedId, setSelectedId] = React.useState(recommended.id);
  // All disclosures start collapsed — Simon is only revealed when the user
  // taps "Other clinicians", and each time-shift section toggles independently.
  const [showOthers, setShowOthers] = React.useState(false);
  const [openBefore, setOpenBefore] = React.useState(false);
  const [openAfter, setOpenAfter] = React.useState(false);

  // Compute relative time labels for the −15/+15 fallback sections.
  // Falls back to a sensible default if state.selectedSlot is missing
  // (e.g. someone navigates here directly during dev).
  const sel = state?.selectedSlot;
  const NOW = BOOKING_NOW;
  const today = React.useMemo(() => { const d = new Date(NOW); d.setHours(0, 0, 0, 0); return d; }, []);
  const exactDate = React.useMemo(() => {
    if (!sel) return null;
    const dayObj = addDays(today, sel.day);
    const band = TIME_BANDS.find((b) => b.id === sel.band) || TIME_BANDS[0];
    return slotDate(dayObj, band, sel.h, sel.m);
  }, [sel, today]);
  const formatSlotLabel = (date) => {
    if (!date) return '';
    const diff = dayDiff(date, today);
    const dayWord = diff === 0 ? 'Today'
      : diff === 1 ? 'Tomorrow'
      : `${DAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
    return `${dayWord} at ${fmtTime(date.getHours(), date.getMinutes())}`;
  };
  const labelBefore = exactDate ? formatSlotLabel(new Date(exactDate.getTime() - 15 * 60000)) : 'Today at 07:45';
  const labelAfter = exactDate ? formatSlotLabel(new Date(exactDate.getTime() + 15 * 60000)) : 'Today at 08:15';

  const selectedClinician = allClinicians.find((c) => c.id === selectedId) || recommended;
  // Prototype convention: every clinician renders as "Advanced Clinician"
  // regardless of underlying role, to keep the demo copy consistent with
  // the booking-details breadcrumb.
  const fullRole = () => 'Advanced Clinician';

  const member = state?.member || 'Jane Doe';
  const concern = state?.concern || 'Your concern';

  const onBook = () => {
    setState((s) => ({ ...s, clinician: selectedClinician }));
    go('confirmed');
  };

  return (
    <BookingShell
      go={go} onClose={onClose}
      progress={75}
      breadcrumb={
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0, width: '100%' }}>
          <span style={{ color: '#030712', fontWeight: 600 }}>Booking details</span>
          <span style={{ color: '#4B5563', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member} · {concern} · {fullRole(selectedClinician)}</span>
        </span>
      }
      footer={
        <button
          onClick={onBook}
          style={{
            all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 8, padding: '12px 16px', width: '100%', height: 40,
            background: 'var(--dca-primary)',
            boxShadow: 'var(--dca-card-shadow)', borderRadius: 9999,
            fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
            color: 'var(--dca-tint)',
          }}>
          Book now with {selectedClinician.first}
        </button>
      }>

      <div style={{
        fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712'
      }}>Meet your clinician</div>

      {/* Recommended (Jane) */}
      <ClinicianRecommendedCard
        clinician={recommended}
        selected={selectedId === recommended.id}
        onSelect={() => setSelectedId(recommended.id)}
        roleLabel={fullRole(recommended)} />

      {/* Other clinicians — disclosure expands inline to the one alternate
          card (Simon). Banner + time accordions are SIBLINGS below, not
          children, so they show up in the normal document flow only after
          "Other clinicians" has been opened. */}
      <SectionDisclosure
        title="Other clinicians"
        open={showOthers}
        onToggle={() => setShowOthers((v) => !v)}>
        {otherClinicians.map((c) => (
          <ClinicianMiniCard
            key={c.id} clinician={c}
            selected={selectedId === c.id}
            onSelect={() => setSelectedId(c.id)}
            roleLabel={fullRole(c)} />
        ))}
      </SectionDisclosure>

      {/* No-exact-match fallback — gated on the same boolean as "Other
          clinicians". Not rendered at all while that disclosure is closed.
          Renders as siblings in the document flow once open, with the
          standard shell gap (no extra container, no special-case spacing). */}
      {showOthers && (
        <>
          <FallbackInfoBanner />

          <TimeShiftDisclosure
            label={labelBefore}
            open={openBefore}
            onToggle={() => setOpenBefore((v) => !v)}>
            <ClinicianMiniCard
              clinician={fallbackBefore}
              selected={selectedId === fallbackBefore.id}
              onSelect={() => setSelectedId(fallbackBefore.id)}
              roleLabel={fullRole(fallbackBefore)} />
          </TimeShiftDisclosure>

          <TimeShiftDisclosure
            label={labelAfter}
            open={openAfter}
            onToggle={() => setOpenAfter((v) => !v)}>
            <ClinicianMiniCard
              clinician={fallbackAfter}
              selected={selectedId === fallbackAfter.id}
              onSelect={() => setSelectedId(fallbackAfter.id)}
              roleLabel={fullRole(fallbackAfter)} />
          </TimeShiftDisclosure>
        </>
      )}
    </BookingShell>
  );
}

// ─── Shared atoms used by MeetClinicianScreen ──────────────────

function SparkleIcon({ size = 12, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5 10.2 7.7 12 3z"
        fill={color} />
    </svg>
  );
}

function BadgeCheckIcon({ size = 12, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 1.8 3-.3 1.3 2.7 2.7 1.3-.3 3L23 13l-1.8 2.4.3 3-2.7 1.3-1.3 2.7-3-.3L12 24l-2.4-1.9-3 .3-1.3-2.7L2.6 18.4l.3-3L1 13l1.9-2.4-.3-3L5.3 6.3 6.6 3.6l3 .3L12 2z"
        fill={color} opacity="0.18" />
      <path d="M8.5 12.5l2.3 2.3L15.8 9.7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoubleCheckIcon({ size = 14, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 13l4 4 8-9" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 17l1.5 1.6 9.5-10.6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronToggle({ open, size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RatingBadge({ rating, reviews }) {
  return (
    <div style={{
      display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, background: '#3B82F6',
      fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
      color: '#FFFFFF', whiteSpace: 'nowrap',
    }}>
      <BadgeCheckIcon size={12} />
      {rating}/5 ({reviews} patient reviews)
    </div>
  );
}

function SelectButton({ selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 9999, minWidth: 96,
        background: selected ? 'var(--dca-primary)' : '#FFFFFF',
        border: selected ? '1px solid var(--dca-primary)' : '1px solid #FFB306',
        color: selected ? 'var(--dca-tint)' : '#030712',
        fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
      }}>
      {selected && <DoubleCheckIcon size={14} color="var(--dca-tint)" />}
      {selected ? 'Selected' : 'Select'}
    </button>
  );
}

function ClinicianRecommendedCard({ clinician, selected, onSelect, roleLabel }) {
  return (
    <div style={{
      position: 'relative',
      boxSizing: 'border-box', width: '100%',
      background: 'var(--dca-tint)',
      border: '2px solid var(--dca-primary)', borderRadius: 16,
      padding: 24, marginTop: 10,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 10px 15px -3px rgba(15,55,190,0.10), 0 4px 6px -4px rgba(15,55,190,0.10)',
    }}>
      {/* Recommended badge — overlaps the top edge */}
      <div style={{
        position: 'absolute', top: -10, left: 16,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 9999,
        background: 'var(--dca-primary)', color: '#FFFFFF',
        fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, lineHeight: '14px',
      }}>
        <SparkleIcon size={12} />
        Recommended
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ClinicianAvatar c={clinician} size={48} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>{clinician.name}</div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>{roleLabel}</div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
            Joined Doctor Care Anywhere in {clinician.joined}
          </div>
          <RatingBadge rating={clinician.rating} reviews={clinician.reviews} />
        </div>
      </div>

      <div style={{
        fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '18px',
        color: '#414245',
      }}>{clinician.bio}</div>

      <div><SelectButton selected={selected} onClick={onSelect} /></div>
    </div>
  );
}

function ClinicianMiniCard({ clinician, selected, onSelect, roleLabel }) {
  return (
    <div style={{
      boxSizing: 'border-box', width: '100%',
      background: '#FFFFFF',
      border: '1px solid #D7E9FF', borderRadius: 16,
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 4px 6px -1px rgba(15,55,190,0.05), 0 2px 4px -2px rgba(15,55,190,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ClinicianAvatar c={clinician} size={48} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#030712' }}>{clinician.name}</div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>{roleLabel}</div>
          <div style={{ fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563' }}>
            Joined Doctor Care Anywhere in {clinician.joined}
          </div>
          <RatingBadge rating={clinician.rating} reviews={clinician.reviews} />
        </div>
      </div>

      <div><SelectButton selected={selected} onClick={onSelect} /></div>
    </div>
  );
}

function SectionDisclosure({ title, open, onToggle, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%',
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
          color: 'var(--dca-primary)',
        }}>
        <span>{title}</span>
        <ChevronToggle open={open} />
      </button>
      {open && children}
    </div>
  );
}

function FallbackInfoBanner() {
  return (
    <div style={{
      boxSizing: 'border-box', width: '100%',
      background: '#FFFFFF',
      border: '1px solid #D7E9FF', borderRadius: 16,
      padding: 16,
      display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    }}>
      <div style={{
        flexShrink: 0, width: 20, height: 20, borderRadius: 9999,
        background: 'var(--dca-primary)', display: 'grid', placeItems: 'center',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v.01M12 11v5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px', color: '#030712'
        }}>Need a few more options?</div>
        <div style={{
          fontFamily: "'Work Sans'", fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#4B5563'
        }}>See below a few more clinicians available around the date and time you selected.</div>
      </div>
    </div>
  );
}

function TimeShiftDisclosure({ label, open, onToggle, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%',
          fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 12, lineHeight: '16px',
          color: 'var(--dca-primary)',
        }}>
        <span>{label}</span>
        <ChevronToggle open={open} />
      </button>
      {open && children}
    </div>
  );
}

Object.assign(window, {
  ApptScreen, ConfirmedScreen, ExitSheet, ReminderScreen, ReminderDoneScreen,
  CalendarSheet, CLINICIANS, DAYS, fmtDayShort, fmtDayLong, fmtTime12,
  MeetClinicianScreen,
});
