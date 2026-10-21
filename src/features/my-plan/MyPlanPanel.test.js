import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import MyPlanPanel from './MyPlanPanel';
beforeAll(()=>{
  HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
const row={date:'2026-10-22',start_time:'07:30:00',duration_min:90,room:'A2',instructor:'T'};
const items=[
  {kind:'modified',event_id:'m',subject:'MUD',type:'Lab',original:row,current:{...row,start_time:'12:00:00'},override:{action:'modify',reason:'prowadzący'}},
  {kind:'cancelled',event_id:'c',subject:'AOE',type:'Ćw',original:row,current:null,override:{action:'cancel'}},
  {kind:'added',event_id:'a',added_event_id:'added-1',subject:'MUD',type:'Lab',original:row,current:row,override:null},
  {kind:'modified',event_id:'old',subject:'Fizyka',original:{...row,date:'2026-10-05'},current:{...row,date:'2026-10-05',room:'B'},override:{action:'modify'}},
];
const proposal={id:'p',event_id:'m',subject:'MUD',operation:'upsert',original:row,before:row,after:{...row,room:'D4'},reason:'sala zmieniona'};
const props=extra=>({items,proposals:[proposal],today:'2026-10-21',onClose:jest.fn(),onApply:jest.fn().mockResolvedValue(),
  onRemoveAdded:jest.fn().mockResolvedValue(),onConfirmProposal:jest.fn().mockResolvedValue(),onDismissProposal:jest.fn(),onShow:jest.fn(),...extra});
test('entries are grouped with plain before/after and past ones are folded away',()=>{
  render(<MyPlanPanel {...props()}/>);
  const dialog=screen.getByRole('dialog',{name:'Mój plan'});
  expect(within(dialog).getByText('Przeniesione i zmienione (1)')).toBeInTheDocument();
  expect(within(dialog).getByText('czw 22.10 07:30–09:00 → czw 22.10 12:00–13:30')).toBeInTheDocument();
  expect(within(dialog).getByText('prowadzący')).toBeInTheDocument();
  expect(within(dialog).getByText('Odwołane u mnie (1)')).toBeInTheDocument();
  expect(within(dialog).getByText('Odrabiania (1)')).toBeInTheDocument();
  expect(within(dialog).getByText('Wcześniejsze (1)')).toBeInTheDocument();
  expect(within(dialog).getByText('Do zatwierdzenia (1)')).toBeInTheDocument();
  expect(within(dialog).getByText('sala A2 → D4')).toBeInTheDocument();
});
test('actions restore, remove makeup classes, show in calendar and handle agent proposals',async()=>{
  const p=props();render(<MyPlanPanel {...p}/>);
  const restore=screen.getAllByRole('button',{name:'Przywróć'});
  fireEvent.click(restore[0]);
  await waitFor(()=>expect(p.onApply).toHaveBeenCalledWith({event_id:'m',operation:'delete'}));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Usuń z planu'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Usuń z planu'}));
  await waitFor(()=>expect(p.onRemoveAdded).toHaveBeenCalledWith('added-1'));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Zatwierdź'})).toBeEnabled());
  fireEvent.click(screen.getAllByRole('button',{name:'Pokaż'})[0]);
  expect(p.onShow).toHaveBeenCalledWith(items[0]);
  fireEvent.click(screen.getByRole('button',{name:'Zatwierdź'}));
  await waitFor(()=>expect(p.onConfirmProposal).toHaveBeenCalledWith(proposal));
  await waitFor(()=>expect(screen.getByRole('button',{name:'Odrzuć'})).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'Odrzuć'}));
  expect(p.onDismissProposal).toHaveBeenCalledWith('p');
});
test('a failed action is reported in the panel',async()=>{
  render(<MyPlanPanel {...props({onApply:jest.fn().mockRejectedValue(new Error('Plan zmienił się.'))})}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Przywróć'})[0]);
  expect(await screen.findByRole('alert')).toHaveTextContent('Plan zmienił się.');
});
test('an empty plan explains how to make changes',()=>{
  render(<MyPlanPanel {...props({items:[],proposals:[]})}/>);
  expect(screen.getByText(/Kliknij zajęcia w kalendarzu/)).toBeInTheDocument();
});
