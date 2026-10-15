import {useState,useEffect,useCallback,useRef} from 'react';
import {personalRequest} from './personalScheduleApi';
const EMPTY=[];
export function usePersonalOverrides(user,enabled,refreshNonce) {
  const uid=enabled?user?.uid||'':'';
  const [state,setState]=useState({uid:'',rows:[],status:'idle',error:''});
  const [tick,setTick]=useState(0);
  const currentUid=useRef(uid);currentUid.current=uid;
  useEffect(()=>{
    if(!uid)return undefined;
    let active=true;
    setState(previous=>({uid,rows:previous.uid===uid?previous.rows:[],status:'loading',error:''}));
    personalRequest('overrides').then(data=>{
      if(active&&currentUid.current===uid)setState({uid,rows:data.overrides,status:'ready',error:''});
    }).catch(error=>{
      if(active&&currentUid.current===uid)setState(previous=>({...previous,status:'error',error:error.message}));
    });
    return ()=>{active=false;};
  },[uid,tick,refreshNonce]);
  const refresh=useCallback(()=>setTick(value=>value+1),[]);
  return {rows:uid&&state.uid===uid?state.rows:EMPTY,ready:!uid||(state.uid===uid&&state.status==='ready'),
    error:uid&&state.uid===uid?state.error:'',refresh};
}
