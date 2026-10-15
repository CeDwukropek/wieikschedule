import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import AiSettings from './AiSettings';
import {personalRequest} from '../my-plan/personalScheduleApi';
let mockUser;
jest.mock('../auth/useFirebaseAuth',()=>({useFirebaseAuth:()=>({user:mockUser})}));
jest.mock('../my-plan/personalScheduleApi',()=>({personalRequest:jest.fn()}));
const settings={provider:'n8n',model:'',local_endpoint:'',has_api_key:false};
beforeEach(()=>{jest.clearAllMocks();mockUser={uid:'owner-a'};});
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
