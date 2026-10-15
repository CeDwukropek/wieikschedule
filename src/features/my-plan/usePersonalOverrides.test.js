import {act,renderHook,waitFor} from '@testing-library/react';
import {usePersonalOverrides} from './usePersonalOverrides';
import {personalRequest} from './personalScheduleApi';
jest.mock('./personalScheduleApi',()=>({personalRequest:jest.fn()}));
test('a late private response cannot leak into a different user or guest view',async()=>{
 let resolveA;personalRequest.mockImplementationOnce(()=>new Promise(resolve=>{resolveA=resolve;})).mockResolvedValueOnce({overrides:[{event_id:'b'}]});
 const {result,rerender}=renderHook(({user})=>usePersonalOverrides(user,true),{initialProps:{user:{uid:'a'}}});
 rerender({user:{uid:'b'}});
 await waitFor(()=>expect(result.current.rows).toEqual([{event_id:'b'}]));
 await act(async()=>resolveA({overrides:[{event_id:'a'}]}));
 expect(result.current.rows).toEqual([{event_id:'b'}]);
 rerender({user:null});expect(result.current.rows).toEqual([]);
});
test('failed override read is not treated as confirmed empty data',async()=>{
 personalRequest.mockRejectedValueOnce(new Error('offline'));
 const {result}=renderHook(()=>usePersonalOverrides({uid:'a'},true));
 await waitFor(()=>expect(result.current.error).toBe('offline'));
 expect(result.current.ready).toBe(false);
});
