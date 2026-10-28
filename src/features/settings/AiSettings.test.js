import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import AiSettings from './AiSettings';
import {personalRequest} from '../my-plan/personalScheduleApi';
import {nativeCapabilities,setLocalToken} from '../chat/localOdysseus';
let mockUser;
jest.mock('../auth/useFirebaseAuth',()=>({useFirebaseAuth:()=>({user:mockUser})}));
jest.mock('../my-plan/personalScheduleApi',()=>({personalRequest:jest.fn()}));
let mockStoredToken='';
jest.mock('../chat/localOdysseus',()=>({nativeCapabilities:jest.fn(),setLocalToken:jest.fn(),localToken:()=>mockStoredToken,
  isTokenRemembered:()=>Boolean(mockStoredToken)}));
const settings={provider:'n8n',model:'',local_endpoint:'',has_api_key:false};
const openAiFlag=process.env.REACT_APP_OPENAI_ASSISTANT;
beforeEach(()=>{jest.clearAllMocks();mockUser={uid:'owner-a'};mockStoredToken='';process.env.REACT_APP_OPENAI_ASSISTANT='true';});
afterAll(()=>{process.env.REACT_APP_OPENAI_ASSISTANT=openAiFlag;});
test('saving the first key loads a dynamic dropdown and preserves model selection',async()=>{
  personalRequest.mockImplementation(async(path,body)=>{
    if(path==='models')return {models:[{id:'available-a'},{id:'available-b'}]};
    return {settings:body?{...settings,model:body.model,has_api_key:true}:settings};
  });
  render(<AiSettings/>);
  const select=await screen.findByRole('combobox',{name:'Model OpenAI'});
  expect(select).toBeDisabled();expect(personalRequest).not.toHaveBeenCalledWith('models');
  fireEvent.change(screen.getByLabelText('Klucz API'),{target:{value:'synthetic-key'}});
  fireEvent.click(screen.getByRole('button',{name:'Zapisz ustawienia AI'}));
  await screen.findByRole('option',{name:'available-b'});
  expect(screen.getByLabelText('Klucz API')).toHaveValue('');
  fireEvent.change(screen.getByRole('combobox',{name:'Model OpenAI'}),{target:{value:'available-b'}});
  fireEvent.click(screen.getByRole('button',{name:'Zapisz ustawienia AI'}));
  await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({model:'available-b',api_key:''})));
});
test('provider failure keeps the saved model and permits manual selection',async()=>{
  personalRequest.mockImplementation(async path=>{
    if(path==='models')throw new Error('Brak uprawnień do listy');
    return {settings:{...settings,model:'saved-model',has_api_key:true}};
  });
  render(<AiSettings/>);
  await screen.findByText('Brak uprawnień do listy');
  expect(screen.getByRole('combobox',{name:'Model OpenAI'})).toHaveValue('saved-model');
  fireEvent.click(screen.getByText('Wpisz nazwę modelu ręcznie'));
  fireEvent.change(screen.getByLabelText('Nazwa modelu'),{target:{value:'manual-model'}});
  expect(screen.getByRole('combobox',{name:'Model OpenAI'})).toHaveValue('manual-model');
});
test('a late catalogue response cannot appear under a different account',async()=>{
  let resolveA;
  personalRequest.mockImplementation(path=>{
    if(path==='models')return new Promise(resolve=>{resolveA=resolve;});
    return Promise.resolve({settings:{...settings,has_api_key:mockUser.uid==='owner-a'}});
  });
  const {rerender}=render(<AiSettings/>);
  await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('models'));
  mockUser={uid:'owner-b'};rerender(<AiSettings/>);
  await waitFor(()=>expect(screen.getByRole('combobox',{name:'Model OpenAI'})).toBeDisabled());
  await act(async()=>resolveA({models:[{id:'private-a-model'}]}));
  expect(screen.queryByRole('option',{name:'private-a-model'})).not.toBeInTheDocument();
});
test('native connection loads local models and saves selection without persisting the access token',async()=>{
 const local={...settings,provider:'odysseus',local_endpoint:'https://native.test'};
 personalRequest.mockImplementation(async(path,body)=>({settings:{...local,...body}}));
 nativeCapabilities.mockResolvedValue({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',name:'My local server',models:['model-a','model-b']}]});
 render(<AiSettings/>);
 await screen.findByLabelText('Adres Odysseusa');
 fireEvent.change(screen.getByLabelText('Token dostępu Odysseusa (chat)'),{target:{value:'ody_synthetic'}});
 fireEvent.click(screen.getByRole('button',{name:'Sprawdź połączenie z Odysseusem'}));
 await screen.findByRole('option',{name:'model-b'});
 // A working connection is saved with the local model chosen by itself; a model choice is saved at once.
 await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({local_endpoint:'https://native.test',local_endpoint_id:'local',local_model:'model-a'})));
 expect(await screen.findByText('Połączenie działa i zostało zapisane.')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Model Odysseusa'),{target:{value:'model-b'}});
 await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({local_endpoint_id:'local',local_model:'model-b'})));
 expect(screen.queryByRole('button',{name:'Zapisz ustawienia AI'})).not.toBeInTheDocument();
 expect(setLocalToken).toHaveBeenCalledWith('owner-a','ody_synthetic',{remember:true});
 expect(JSON.stringify(personalRequest.mock.calls)).not.toContain('ody_synthetic');
});
test('a remembered token lists the models at once; unticking forgets it on this device',async()=>{
 mockStoredToken='ody_remembered';
 const local={...settings,provider:'odysseus',local_endpoint:'https://native.test',local_endpoint_id:'local',local_model:'model-b'};
 personalRequest.mockImplementation(async(path,body)=>({settings:{...local,...body}}));
 nativeCapabilities.mockResolvedValue({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',name:'My local server',models:['model-a','model-b']}]});
 render(<AiSettings/>);
 expect(await screen.findByRole('option',{name:'model-b'})).toBeInTheDocument();
 expect(nativeCapabilities).toHaveBeenCalledWith('https://native.test','owner-a','ody_remembered',expect.anything());
 expect(screen.getByLabelText('Model Odysseusa')).toHaveValue('model-b');
 const remember=screen.getByRole('checkbox',{name:/Zapamiętaj token/});
 expect(remember).toBeChecked();
 fireEvent.click(remember);
 expect(setLocalToken).toHaveBeenCalledWith('owner-a','ody_remembered',{remember:false});
});
test('a catalogue containing only cloud models requires an explicit provider selection',async()=>{
 const local={...settings,provider:'odysseus',local_endpoint:'https://native.test'};
 personalRequest.mockImplementation(async(path,body)=>({settings:{...local,...body}}));
 nativeCapabilities.mockResolvedValue({endpoints:[
   {id:'openai',name:'OpenAI',execution:'cloud',destination:'OpenAI',models:['openai-test']},
   {id:'google',name:'Google Gemini',execution:'cloud',destination:'Google Gemini',models:['gemini-test']}
 ]});
 render(<AiSettings/>);
 fireEvent.click(await screen.findByRole('button',{name:'Sprawdź połączenie z Odysseusem'}));
 const connection=await screen.findByLabelText('Połączenie z modelem');
 expect(connection).toHaveValue('');
 expect(screen.queryByRole('note')).not.toBeInTheDocument();
 fireEvent.change(connection,{target:{value:'google'}});
 expect(screen.getByLabelText('Model Odysseusa')).toHaveValue('gemini-test');
 expect(screen.getByRole('note')).toHaveTextContent('Wybrany dostawca: Google Gemini');
 expect(screen.getByRole('note')).toHaveTextContent('historia rozmowy i wyniki narzędzi planu');
 expect(screen.queryByLabelText('Klucz API')).not.toBeInTheDocument();
 await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({local_endpoint_id:'google',local_model:'gemini-test',api_key:''})));
 // Before the explicit choice, the connection was saved without a cloud provider.
 expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({local_endpoint_id:'',local_model:''}));
});
test('connection discovery prefers a local model over a cloud model listed first',async()=>{
 const local={...settings,provider:'odysseus',local_endpoint:'https://native.test'};
 personalRequest.mockImplementation(async(path,body)=>({settings:{...local,...body}}));
 nativeCapabilities.mockResolvedValue({endpoints:[
   {id:'cloud',name:'OpenAI',execution:'cloud',destination:'OpenAI',models:['cloud-test']},
   {id:'local',name:'Local server',execution:'local',models:['local-test']}
 ]});
 render(<AiSettings/>);
 fireEvent.click(await screen.findByRole('button',{name:'Sprawdź połączenie z Odysseusem'}));
 expect(await screen.findByLabelText('Połączenie z modelem')).toHaveValue('local');
 expect(screen.getByLabelText('Model Odysseusa')).toHaveValue('local-test');
 expect(screen.queryByRole('note')).not.toBeInTheDocument();
});
test('a failed connection check is explained inside the connection step, next to its button',async()=>{
 personalRequest.mockResolvedValue({settings:{...settings,provider:'odysseus',local_endpoint:'https://native.test'}});
 nativeCapabilities.mockRejectedValueOnce(new Error('Odysseus wymaga logowania. Wpisz token dostępu albo zaloguj się do Odysseusa w tej przeglądarce.'));
 render(<AiSettings/>);
 fireEvent.click(await screen.findByRole('button',{name:'Sprawdź połączenie z Odysseusem'}));
 const message=await screen.findByText(/Odysseus wymaga logowania/);
 const step=screen.getByRole('button',{name:'Sprawdź połączenie z Odysseusem'}).parentElement;
 expect(step).toContainElement(message);
 expect(screen.getByText('Połączenie nie działa')).toBeInTheDocument();
});

test('without the OpenAI flag only Odysseus is offered and a saved OpenAI choice is saved as Odysseus',async()=>{
 process.env.REACT_APP_OPENAI_ASSISTANT='false';
 personalRequest.mockImplementation(async(path,body)=>({settings:{...settings,provider:'n8n',local_endpoint:'https://native.test',...body}}));
 nativeCapabilities.mockResolvedValue({protocol:'wieik-schedule-native-v1',endpoints:[{id:'local',name:'Local',models:['model-a']}]});
 render(<AiSettings/>);
 expect(await screen.findByLabelText('Adres Odysseusa')).toBeInTheDocument();
 expect(screen.queryByText('OpenAI z własnym kluczem')).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Klucz API')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Sprawdź połączenie z Odysseusem'}));
 await waitFor(()=>expect(personalRequest).toHaveBeenCalledWith('ai-settings',expect.objectContaining({provider:'odysseus',local_model:'model-a'})));
});
