import { useId, useState } from 'react';
import { roleLabel } from './planRoles';

// "Mam kod zaproszenia": a code from an admin or starosta gives its role to the signed-in user.
export default function RedeemInvite({ onRedeem }) {
  const id = useId();
  const [code, setCode] = useState(''), [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null), [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError(''); setResult(null);
    try { setResult(await onRedeem(code)); setCode(''); } catch (failure) { setError(failure.message || 'Nie udało się użyć kodu.'); }
    finally { setBusy(false); }
  };
  return <form className="redeem-invite" onSubmit={submit}>
    <label htmlFor={`${id}-code`}>Mam kod zaproszenia</label>
    <div>
      <input id={`${id}-code`} value={code} autoComplete="off" spellCheck={false} placeholder="XXXX-XXXX-XXXX" maxLength={20}
        onChange={event => setCode(event.target.value.toUpperCase())}/>
      <button type="submit" disabled={busy || code.replace(/[^A-Z0-9]/gi, '').length !== 12}>{busy ? 'Sprawdzanie…' : 'Użyj kodu'}</button>
    </div>
    {result && <p role="status" className="redeem-invite-done">Masz teraz rolę: {roleLabel(result)}.{result.replaced ? ' Poprzednia osoba ją straciła.' : ''}</p>}
    {error && <p role="alert" className="plan-item-alert">{error}</p>}
  </form>;
}
