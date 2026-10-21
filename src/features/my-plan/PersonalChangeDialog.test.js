import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import PersonalChangeDialog from './PersonalChangeDialog';
const source={id:'source-id',subject:'Math',date:'2026-10-12',start_time:'09:00:00',duration_min:90,room:'A',instructor:'Teacher'};
test('an own edit is saved in one step and an empty room is sent as an explicit null',async()=>{
 const apply=jest.fn().mockResolvedValue({event_id:'source-id',operation:'delete'});
 render(<PersonalChangeDialog source={source} onApply={apply} onConfirmProposal={jest.fn()} onClose={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Sala'),{target:{value:''}});
 fireEvent.click(screen.getByRole('button',{name:'Zapisz zmianę'}));
 await waitFor(()=>expect(apply).toHaveBeenCalledTimes(1));
 expect(apply).toHaveBeenCalledWith({event_id:'source-id',operation:'upsert',action:'modify',patch:{room:null},reason:null});
 expect(screen.queryByRole('button',{name:'Zatwierdź zmianę'})).not.toBeInTheDocument();
});
test('a failed save keeps the dialog open with the reason',async()=>{
 const apply=jest.fn().mockRejectedValue(new Error('Plan zmienił się lub podgląd wygasł.'));
 render(<PersonalChangeDialog source={source} onApply={apply} onConfirmProposal={jest.fn()} onClose={()=>{}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Odwołaj tylko dla mnie'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Plan zmienił się');
 expect(screen.getByRole('button',{name:'Odwołaj tylko dla mnie'})).toBeEnabled();
});
test('an agent suggestion is shown as a preview and saved only after confirmation',async()=>{
 const proposal={id:'preview-id',provider:'odysseus',session_id:'chat',source,before:source,after:{...source,room:'B'}};
 const confirm=jest.fn().mockResolvedValue();const apply=jest.fn();
 render(<PersonalChangeDialog source={source} initialProposal={proposal} onApply={apply} onConfirmProposal={confirm} onClose={()=>{}}/>);
 expect(confirm).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Zatwierdź zmianę'}));
 await waitFor(()=>expect(confirm).toHaveBeenCalledWith(proposal));
 expect(apply).not.toHaveBeenCalled();
});
