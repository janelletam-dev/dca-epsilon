// DCA Booking V3 — main app shell

// Demo configuration — edit these to switch personas / test states.
//   persona:    'b2b' (AXA-covered) | 'payg' (pay as you go)
//   errorMode:  'none' | 'fewhours' (GP scarce) | 'noslots' (fully booked)
//   anonymise:  hide clinician names + photos
const CONFIG = {
  persona: 'b2b',
  errorMode: 'none',
  anonymise: false,
};

// Tweak defaults — rewritten on disk when the user changes a value in the
// Tweaks panel. Keep this block as valid JSON between the markers so the host
// can parse + merge edits.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "clinical",
  "surface": "soft",
  "pace": "comfy"
}/*EDITMODE-END*/;

function DCAApp() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [step, setStep] = React.useState('home');
  const [history, setHistory] = React.useState([]);
  const [showExit, setShowExit] = React.useState(false);
  const [state, setState] = React.useState({
    member: 'Test Demo User',
    category: null,
    concern: null,
    clinician: null,
    slot: null,
    selectedSlot: null,
  });

  const go = (next, opts = {}) => {
    if (next === 'back') {
      setHistory(h => {
        const prev = h[h.length - 1] || 'home';
        setStep(prev);
        return h.slice(0, -1);
      });
      return;
    }
    // Edit-mode: rewind history to the previous occurrence of `next` so the back
    // button behaves sensibly (no looping through the screens that came after).
    if (opts.edit) {
      setHistory(h => {
        const idx = h.indexOf(next);
        if (idx >= 0) {
          setStep(next);
          return h.slice(0, idx);
        }
        setStep(next);
        return h;
      });
      return;
    }
    setHistory(h => [...h, step]);
    setStep(next);
  };

  const close = () => setShowExit(true);
  const onExit = () => {
    setShowExit(false);
    setHistory([]);
    setStep('home');
    setState(s => ({ ...s, category: null, concern: null, clinician: null, slot: null, selectedSlot: null }));
  };
  const onReminder = () => { setShowExit(false); go('reminder'); };

  let screen = null;
  switch (step) {
    case 'home':
      screen = <HomeScreen go={go} state={state} persona={CONFIG.persona} errorMode={CONFIG.errorMode}/>; break;
    case 'emergency':
      screen = <EmergencyScreen go={go} onClose={close}/>; break;
    case 'member':
      screen = <MemberScreen go={go} onClose={close}/>; break;
    case 'search':
      screen = <SearchScreen go={go} setState={setState} onClose={close}/>; break;
    case 'concern':
      screen = <ConcernScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'attach':
      screen = <AttachScreen go={go} state={state} onClose={close}/>; break;
    case 'clinician-type':
      screen = <ClinicianTypeScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'time-of-day':
      screen = <TimeOfDayScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'appt':
      screen = <ApptScreen go={go} state={state} setState={setState} onClose={close} anonymise={CONFIG.anonymise} errorMode={CONFIG.errorMode}/>; break;
    case 'meet-clinician':
      screen = <MeetClinicianScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'confirmed':
      screen = <ConfirmedScreen go={go} state={state} persona={CONFIG.persona}/>; break;
    case 'reminder':
      screen = <ReminderScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'reminder-done':
      screen = <ReminderDoneScreen go={go}/>; break;
    default:
      screen = <HomeScreen go={go} state={state} persona={CONFIG.persona} errorMode={CONFIG.errorMode}/>;
  }

  return (
    <div
      data-dca-theme="dca"
      data-dca-palette={tweaks.palette === 'clinical' ? undefined : tweaks.palette}
      data-dca-surface={tweaks.surface === 'soft' ? undefined : tweaks.surface}
      data-dca-pace={tweaks.pace === 'comfy' ? undefined : tweaks.pace}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <StatusBarOverlay/>
      {screen}
      {showExit && step !== 'home' && (
        <ExitSheet onCancel={() => setShowExit(false)} onExit={onExit} onReminder={onReminder}/>
      )}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette" />
        <TweakRadio
          label="Brand"
          value={tweaks.palette}
          options={[
            { value: 'clinical', label: 'Clinical' },
            { value: 'warm',     label: 'Warm' },
            { value: 'sage',     label: 'Sage' },
            { value: 'plum',     label: 'Plum' },
          ]}
          onChange={(v) => setTweak('palette', v)} />
        <TweakSection label="Surface" />
        <TweakRadio
          label="Cards"
          value={tweaks.surface}
          options={[
            { value: 'soft',  label: 'Soft'  },
            { value: 'crisp', label: 'Crisp' },
            { value: 'glass', label: 'Glass' },
          ]}
          onChange={(v) => setTweak('surface', v)} />
        <TweakSection label="Pace" />
        <TweakRadio
          label="Spacing"
          value={tweaks.pace}
          options={[
            { value: 'cozy',  label: 'Cozy'  },
            { value: 'comfy', label: 'Comfy' },
            { value: 'roomy', label: 'Roomy' },
          ]}
          onChange={(v) => setTweak('pace', v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <IOSDevice width={390} height={844} statusBar={false}>
    <DCAApp/>
  </IOSDevice>
);
