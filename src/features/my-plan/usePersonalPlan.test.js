import {act,renderHook,waitFor} from '@testing-library/react';
import {usePersonalPlan} from './usePersonalPlan';
import {authorizedRequest,personalRequest} from './personalScheduleApi';
jest.mock('./personalScheduleApi',()=>({authorizedRequest:jest.fn(),personalRequest:jest.fn()}));
const plan=id=>({overrides:[{event_id:id}],items:[{kind:'modified',event_id:id}],proposals:[]});
beforeEach(()=>jest.clearAllMocks());
test('a late private response cannot leak into a different user or guest view',async()=>{
 let resolveA;authorizedRequest.mockImplementationOnce(()=>new Promise(resolve=>{resolveA=resolve;})).mockResolvedValueOnce(plan('b'));
 const {result,rerender}=renderHook(({user})=>usePersonalPlan(user,true),{initialProps:{user:{uid:'a'}}});
 rerender({user:{uid:'b'}});
 await waitFor(()=>expect(result.current.rows).toEqual([{event_id:'b'}]));
 await act(async()=>resolveA(plan('a')));
 expect(result.current.items).toEqual([{kind:'modified',event_id:'b'}]);
 rerender({user:null});expect(result.current.rows).toEqual([]);expect(result.current.items).toEqual([]);
});
test('a failed read is not treated as an empty plan',async()=>{
 authorizedRequest.mockRejectedValueOnce(new Error('offline'));
 const {result}=renderHook(()=>usePersonalPlan({uid:'a'},true));
 await waitFor(()=>expect(result.current.error).toBe('offline'));
 expect(result.current.ready).toBe(false);
});
test('an edit is applied with a fresh request id, returns its undo and reloads the plan',async()=>{
 authorizedRequest.mockResolvedValue(plan('a'));
 personalRequest.mockResolvedValue({undo:{event_id:'a',operation:'delete'}});
 const {result}=renderHook(()=>usePersonalPlan({uid:'a'},true));
 await waitFor(()=>expect(result.current.ready).toBe(true));
 let undo;
 await act(async()=>{undo=await result.current.apply({event_id:'a',operation:'upsert',action:'cancel',patch:{}});});
 expect(undo).toEqual({event_id:'a',operation:'delete'});
 const [path,body]=personalRequest.mock.calls[0];
 expect(path).toBe('apply');expect(body.request_id).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
 await waitFor(()=>expect(authorizedRequest).toHaveBeenCalledTimes(2));
});
