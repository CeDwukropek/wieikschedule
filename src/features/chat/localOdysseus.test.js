import {nativeUrl,nativeCapabilities,setLocalToken,localToken,clearLocalTokens,isTokenRemembered} from './localOdysseus';
import {sendScheduleAgentMessage} from './scheduleAgentClient';
import {personalRequest} from '../my-plan/personalScheduleApi';
import {auth} from '../../lib/firebaseClient';
jest.mock('../my-plan/personalScheduleApi',()=>({personalRequest:jest.fn()}));
jest.mock('../../lib/firebaseClient',()=>({auth:{currentUser:{uid:'owner-a'}}}));
const settings={provider:'odysseus',local_endpoint:'https://native.test/local-odysseus',local_endpoint_id:'local',local_model:'local-model'};
beforeEach(()=>{jest.clearAllMocks();clearLocalTokens();localStorage.clear();auth.currentUser={uid:'owner-a'};global.fetch=jest.fn();});
afterEach(()=>{delete global.fetch;});
test('native URL preserves a deployment prefix and credentials stay scoped to one account',()=>{
 expect(nativeUrl(settings.local_endpoint,'api/schedule/chat').href).toBe('https://native.test/local-odysseus/api/schedule/chat');
 setLocalToken('owner-a','ody_synthetic');expect(localToken('owner-b')).toBe('');
 setLocalToken('owner-b','ody_other');expect(localToken('owner-a')).toBe('');
 clearLocalTokens();expect(localToken('owner-b')).toBe('');
});
test('native chat separates Odysseus authentication from delegated schedule context',async()=>{
 setLocalToken('owner-a','ody_synthetic');
 personalRequest.mockImplementation(async(path,body)=>path==='ai-settings'?{settings}:{token:'wks1.synthetic.context'});
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',models:['local-model']}]})});
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({ok:true,output:'Test response'})});
 const reply=await sendScheduleAgentMessage({message:'Test',scheduleName:'TEST',sessionId:'s',intent:'makeup',selectedGroups:{L:'L1'}});
 expect(reply.output).toBe('Test response');
 expect(personalRequest).toHaveBeenCalledWith('context',{provider:'odysseus',session_id:'s',intent:'makeup',selection:{faculty:'TEST',groups:{L:'L1'}}});
 const request=fetch.mock.calls[1][1];
 expect(request.headers.Authorization).toBe('Bearer ody_synthetic');
 expect(request.headers['X-Schedule-Context']).toBe('wks1.synthetic.context');
 expect(JSON.parse(request.body)).toEqual(expect.objectContaining({intent:'makeup',groups:{L:'L1'},model:'local-model',use_memory:false}));
 expect(request.body).not.toContain('ody_synthetic');expect(request.body).not.toContain('wks1.');
});
test('legacy adapter and unauthenticated native endpoints fail with a useful message',async()=>{
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({protocol:'wieik-schedule-v1'})});
 await expect(nativeCapabilities(settings.local_endpoint,'owner-a')).rejects.toThrow('natywnej integracji');
 fetch.mockResolvedValueOnce({ok:false,status:401,json:async()=>({})});
 await expect(nativeCapabilities(settings.local_endpoint,'owner-a')).rejects.toThrow('token');
});
test('switching Firebase accounts during the handshake prevents sending the message',async()=>{
 personalRequest.mockImplementation(async path=>{
  if(path==='ai-settings')return {settings};
  auth.currentUser={uid:'owner-b'};return {token:'wks1.synthetic'};
 });
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',models:['local-model']}]})});
 await expect(sendScheduleAgentMessage({message:'Private',scheduleName:'TEST',sessionId:'s'})).rejects.toThrow('Konto zmieniło się');
 expect(fetch).toHaveBeenCalledTimes(1);
});
test('additional groups are signed in the context instead of being left for the model to choose',async()=>{
 const external=[{faculty:'Other',groups:{C:'C2'},subject:'Algebra'}];
 personalRequest.mockImplementation(async path=>path==='ai-settings'?{settings}:{token:'wks1.synthetic'});
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',models:['local-model']}]})});
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({ok:true,output:'Test'})});
 await sendScheduleAgentMessage({message:'Plan jutro',scheduleName:'TEST',sessionId:'s',externalSelections:external});
 expect(personalRequest).toHaveBeenCalledWith('context',expect.objectContaining({selection:{faculty:'TEST',groups:{},external}}));
});

test('a removed endpoint cannot silently route the conversation to another provider',async()=>{
 personalRequest.mockResolvedValue({settings});
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({protocol:'wieik-schedule-native-v1',endpoints:[{id:'cloud',models:['cloud-model']}]})});
 await expect(sendScheduleAgentMessage({message:'Private',scheduleName:'TEST',sessionId:'s'})).rejects.toThrow('Zapisany model lub połączenie jest niedostępne');
 expect(personalRequest).toHaveBeenCalledTimes(1);
 expect(fetch).toHaveBeenCalledTimes(1);
});

test('a remembered token survives a reload (memory cleared) only for its account',()=>{
  setLocalToken('a',' ody_a ',{remember:true});
  clearLocalTokens();
  expect(localToken('a')).toBe('ody_a');
  expect(isTokenRemembered('a')).toBe(true);
  expect(localToken('b')).toBe('');
});
test('a token not remembered lives in memory only; forgetting removes the stored one',()=>{
  setLocalToken('a','ody_a',{remember:true});
  setLocalToken('a','ody_a',{remember:false});
  expect(localToken('a')).toBe('ody_a');
  clearLocalTokens();
  expect(localToken('a')).toBe('');
  setLocalToken('a','ody_memory');
  expect(isTokenRemembered('a')).toBe(false);
});
