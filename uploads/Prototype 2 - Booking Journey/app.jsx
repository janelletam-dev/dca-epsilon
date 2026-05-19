// DCA Booking V2 — main app shell

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "persona": "b2b",
  "errorMode": "none",
  "anonymise": false,
  "showAcpNudge": true
}/*EDITMODE-END*/;

function DCAApp() {
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
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

  const go = (next) => {
    if (next === 'back') {
      setHistory(h => {
        const prev = h[h.length - 1] || 'home';
        setStep(prev);
        return h.slice(0, -1);
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
      screen = <HomeScreen go={go} persona={tweaks.persona} errorMode={tweaks.errorMode}/>; break;
    case 'emergency':
      screen = <EmergencyScreen go={go} onClose={close}/>; break;
    case 'member':
      screen = <MemberScreen go={go} onClose={close}/>; break;
    case 'search':
      screen = <SearchScreen go={go} setState={setState} onClose={close}/>; break;
    case 'concern':
      screen = <ConcernScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'attach':
      screen = <AttachScreen go={go} onClose={close}/>; break;
    case 'appt':
      screen = <ApptScreen go={go} state={state} setState={setState} onClose={close} anonymise={tweaks.anonymise} errorMode={tweaks.errorMode}/>; break;
    case 'summary':
    case 'summary-edit':
      screen = <SummaryScreen go={go} state={state} setState={setState} onClose={close} persona={tweaks.persona}/>; break;
    case 'confirmed':
      screen = <ConfirmedScreen go={go} state={state} persona={tweaks.persona}/>; break;
    case 'reminder':
      screen = <ReminderScreen go={go} state={state} setState={setState} onClose={close}/>; break;
    case 'reminder-done':
      screen = <ReminderDoneScreen go={go}/>; break;
    default:
      screen = <HomeScreen go={go} persona={tweaks.persona} errorMode={tweaks.errorMode}/>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <StatusBarOverlay/>
      {screen}
      {showExit && step !== 'home' && (
        <ExitSheet onCancel={() => setShowExit(false)} onExit={onExit} onReminder={onReminder}/>
      )}
      <DCATweaks tweaks={tweaks} setTweak={setTweak}/>
    </div>
  );
}

function DCATweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks" defaultPosition={{ right: 16, bottom: 16 }}>
      <TweakSection title="Persona" subtitle="Coverage & pricing">
        <TweakRadio
          value={tweaks.persona}
          onChange={(v) => setTweak('persona', v)}
          options={[
            { value: 'b2b', label: 'B2B (AXA)' },
            { value: 'payg', label: 'PAYG' },
          ]}
        />
      </TweakSection>
      <TweakSection title="Availability" subtitle="Test empty states on appt screen">
        <TweakRadio
          value={tweaks.errorMode}
          onChange={(v) => setTweak('errorMode', v)}
          options={[
            { value: 'none', label: 'Normal' },
            { value: 'fewhours', label: 'GP scarce' },
            { value: 'noslots', label: 'Fully booked' },
          ]}
        />
      </TweakSection>
      <TweakSection title="Privacy">
        <TweakToggle
          label="Anonymise clinicians"
          checked={tweaks.anonymise}
          onChange={(v) => setTweak('anonymise', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <IOSDevice width={390} height={844} statusBar={false}>
    <DCAApp/>
  </IOSDevice>
);
