import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import CalendarSyncSettings from './CalendarSyncSettings';
import {authorizedRequest} from '../my-plan/personalScheduleApi';
let mockUser;
jest.mock('../auth/useFirebaseAuth',()=>({useFirebaseAuth:()=>({user:mockUser})}));
jest.mock('../my-plan/personalScheduleApi',()=>({authorizedRequest:jest.fn()}));
const sets=[{id:'set-1',name:'Mój plan'},{id:'set-2',name:'Kolega'}];
const link={id:'00000000-0000-0000-0000-000000000001',label:'Odysseus',faculty:'EiAs3',group_set_id:'set-1',
  last_used_at:'2026-10-21T08:00:00Z',expires_at:'2027-04-19T08:00:00Z',revoked_at:null,active:true};
beforeEach(()=>{jest.clearAllMocks();mockUser={uid:'owner-a'};});
test('code is issued for the chosen group set of the current plan and shown once',async()=>{
  authorizedRequest.mockImplementation(async(path,method)=>method==='GET'?{links:[]}:{code:'ABCD-EFGH-JKMN',expires_at:'2026-10-21T08:10:00Z'});
  render(<CalendarSyncSettings currentSchedule="EiAs3" activeGroupSetId="set-1" groupSetOptions={sets}/>);
  fireEvent.change(await screen.findByRole('combobox',{name:'Zestaw grup'}),{target:{value:'set-2'}});
  fireEvent.click(screen.getByRole('button',{name:'Wygeneruj kod połączenia'}));
  expect(await screen.findByText('ABCD-EFGH-JKMN')).toBeInTheDocument();
  expect(authorizedRequest).toHaveBeenCalledWith('calendar-sync/links','POST',{label:'Odysseus',faculty:'EiAs3',group_set_id:'set-2'});
});
test('revocation needs an explicit second click and refreshes the list',async()=>{
  let links=[link];
  authorizedRequest.mockImplementation(async(path,method)=>{
    if(method==='DELETE'){links=[{...link,active:false,revoked_at:'2026-10-21T09:00:00Z'}];return {revoked:true};}
    return {links};
  });
  render(<CalendarSyncSettings currentSchedule="EiAs3" activeGroupSetId="set-1" groupSetOptions={sets}/>);
  expect(await screen.findByText(/EiAs3, Mój plan/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Odwołaj połączenie'}));
  expect(authorizedRequest).not.toHaveBeenCalledWith('calendar-sync/links','DELETE',expect.anything());
  fireEvent.click(screen.getByRole('button',{name:'Tak, odwołaj'}));
  await waitFor(()=>expect(authorizedRequest).toHaveBeenCalledWith('calendar-sync/links','DELETE',{link_id:link.id}));
  expect(await screen.findByText(/Odwołane/)).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Odwołaj połączenie'})).not.toBeInTheDocument();
});
test('server errors are shown instead of an empty list',async()=>{
  authorizedRequest.mockRejectedValue(new Error('Prywatny plan jest chwilowo niedostępny.'));
  render(<CalendarSyncSettings currentSchedule="EiAs3" activeGroupSetId="set-1" groupSetOptions={sets}/>);
  expect(await screen.findByRole('status')).toHaveTextContent('chwilowo niedostępny');
  expect(screen.queryByText('Ładowanie połączeń…')).not.toBeInTheDocument();
});
