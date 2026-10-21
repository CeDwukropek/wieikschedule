import {useState,useEffect,useCallback,useRef} from 'react';
import {authorizedRequest,personalRequest} from './personalScheduleApi';
const EMPTY=[];
const requestId=()=>(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g,'');
// "Mój plan": private changes, cancellations, makeup classes and agent previews from one request.
export function usePersonalPlan(user,enabled) {
  const uid=enabled?user?.uid||'':'';
  const [state,setState]=useState({uid:'',data:null,status:'idle',error:''});
  const [tick,setTick]=useState(0);
  const currentUid=useRef(uid);currentUid.current=uid;
  useEffect(()=>{
    if(!uid)return undefined;
    let active=true;
    setState(previous=>({uid,data:previous.uid===uid?previous.data:null,status:'loading',error:''}));
    authorizedRequest('my-plan/changes','GET').then(data=>{
      if(active&&currentUid.current===uid)setState({uid,data,status:'ready',error:''});
    }).catch(error=>{
      if(active&&currentUid.current===uid)setState(previous=>({...previous,status:'error',error:error.message}));
    });
    return ()=>{active=false;};
  },[uid,tick]);
  const refresh=useCallback(()=>setTick(value=>value+1),[]);
  // An own edit is saved at once; the response says how to undo it.
  const apply=useCallback(async change=>{
    const data=await personalRequest('apply',{...change,request_id:requestId()});
    refresh();
    return data.undo;
  },[refresh]);
  const confirmProposal=useCallback(async proposal=>{
    await personalRequest('confirm',{proposal_id:proposal.id,provider:proposal.provider,session_id:proposal.session_id});
    refresh();
  },[refresh]);
  const current=uid&&state.uid===uid?state.data:null;
  return {rows:current?.overrides||EMPTY,items:current?.items||EMPTY,proposals:current?.proposals||EMPTY,
    ready:!uid||(state.uid===uid&&Boolean(state.data)),error:uid&&state.uid===uid?state.error:'',
    refresh,apply,confirmProposal};
}
