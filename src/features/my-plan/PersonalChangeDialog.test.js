import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import PersonalChangeDialog from './PersonalChangeDialog';
import {personalRequest} from './personalScheduleApi';
jest.mock('./personalScheduleApi',()=>({personalRequest:jest.fn()}));
const source={id:'source-id',subject:'Math',date:'2026-10-12',start_time:'09:00:00',duration_min:90,room:'A',instructor:'Teacher'};
test('editing previews explicit null and writes only after a separate confirmation',async()=>{
 const proposal={id:'preview-id',provider:'manual',session_id:'manual',source,before:source,after:{...source,room:null}};
 personalRequest.mockResolvedValueOnce({proposal}).mockResolvedValueOnce({result:{}});
 const saved=jest.fn();render(<PersonalChangeDialog source={source} onSaved={saved} onClose={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Sala'),{target:{value:''}});
 fireEvent.click(screen.getByRole('button',{name:'Podgląd zmiany'}));
 await screen.findByRole('button',{name:'Zatwierdź zmianę'});
 expect(personalRequest).toHaveBeenCalledTimes(1);
 expect(personalRequest).toHaveBeenNthCalledWith(1,'propose',{event_id:'source-id',operation:'upsert',action:'modify',patch:{room:null},reason:null});
 expect(saved).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Zatwierdź zmianę'}));
 await waitFor(()=>expect(saved).toHaveBeenCalledTimes(1));
 expect(personalRequest).toHaveBeenNthCalledWith(2,'confirm',{proposal_id:'preview-id',provider:'manual',session_id:'manual'});
});
