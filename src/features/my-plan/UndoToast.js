import {useEffect,useState} from 'react';
// Short-lived confirmation of a saved plan change with a one-click undo.
export default function UndoToast({toast,onDismiss}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    setBusy(false);setError('');
    if(!toast)return undefined;
    const timer=setTimeout(onDismiss,10000);
    return ()=>clearTimeout(timer);
  },[toast,onDismiss]);
  if(!toast)return null;
  const undo=async()=>{
    setBusy(true);setError('');
    try{await toast.undo();onDismiss();}catch(err){setError(err.message);setBusy(false);}
  };
  return <div role="status" aria-live="polite" className="fixed left-1/2 z-[600] w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm shadow-lg"
    style={{bottom:'calc(1.5rem + env(safe-area-inset-bottom))'}}>
    <div className="flex items-center gap-3">
      <span className="flex-1">{error||toast.message}</span>
      {toast.undo&&<button type="button" disabled={busy} className="font-semibold text-sky-300" onClick={undo}>{busy?'Cofanie…':'Cofnij'}</button>}
      <button type="button" aria-label="Zamknij powiadomienie" className="text-neutral-400" onClick={onDismiss}>✕</button>
    </div>
  </div>;
}
