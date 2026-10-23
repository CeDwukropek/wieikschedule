import {render,screen,within} from '@testing-library/react';
import SchedulePlanMessage from './SchedulePlanMessage';
const event={id:'one',date:'2026-10-20',start_time:'09:15:00',duration_min:90,subject:'Analiza obwodów',type:'Ćwiczenia',group:'C3',room:'108D',instructor:'Test Instructor'};
const plan={date_from:'2026-10-19',date_to:'2026-10-23',kind:'exercise',exclude_kinds:[],events:[event,{...event,id:'two',date:'2026-10-21',subject:'Modelowanie'}],total:2,next_offset:null};
test('verified schedule rows render as separate cards grouped by day',()=>{
 render(<SchedulePlanMessage plan={plan}/>);
 const tuesday=screen.getByRole('region',{name:'Zajęcia 2026-10-20'});
 expect(within(tuesday).getByRole('heading')).toHaveTextContent('wtorek, 20 października');
 expect(within(tuesday).getByText('Analiza obwodów')).toBeInTheDocument();
 expect(within(tuesday).getByText('Sala: 108D')).toBeInTheDocument();
 expect(tuesday).toHaveTextContent('09:15–10:45');
 expect(screen.getAllByRole('listitem')).toHaveLength(2);
 expect(screen.getByRole('region',{name:'Zajęcia 2026-10-21'})).toHaveTextContent('Modelowanie');
});
test('event text remains text and cannot inject markup or links',()=>{
 render(<SchedulePlanMessage plan={{...plan,events:[{...event,subject:'<img src=x onerror=alert(1)> [click](https://example.test)'}]}}/>);
 expect(screen.queryByRole('img')).not.toBeInTheDocument();
 expect(screen.queryByRole('link')).not.toBeInTheDocument();
 expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
});
test('filtered empty and partial plans are clearly labelled',()=>{
 const {rerender}=render(<SchedulePlanMessage plan={{...plan,events:[],total:0,exclude_kinds:['lecture','laboratory']}}/>);
 expect(screen.getByText('Bez: Wykłady, Laboratoria')).toBeInTheDocument();
 expect(screen.getByText(/nie znaleziono zajęć pasujących/)).toBeInTheDocument();
 rerender(<SchedulePlanMessage plan={{...plan,events:[event],next_offset:1,total:5}}/>);
 expect(screen.getByText(/Pokazano 1 z 5 zajęć/)).toBeInTheDocument();
});
