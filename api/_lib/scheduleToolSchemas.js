const range={faculty:{type:'string'},date_from:{type:'string',description:'YYYY-MM-DD; inclusive'},date_to:{type:'string',description:'YYYY-MM-DD; at most 31 days'},limit:{type:'integer',minimum:1,maximum:100},offset:{type:'integer',minimum:0}};
const tools=[
  {name:'schedule.get_events',description:'Read effective events in one faculty and date range; use pagination.',properties:range,required:['faculty','date_from','date_to']},
  {name:'schedule.find_event',description:'Find effective events by subject; never guess a UUID.',properties:{...range,query:{type:'string'}},required:['faculty','date_from','date_to','query']},
  {name:'schedule.create_override',description:'Prepare a private modify/cancel preview. Does NOT save a change; user must confirm in the app. Replaces the complete existing patch.',properties:{event_id:{type:'string'},action:{type:'string',enum:['modify','cancel']},patch:{type:'object',additionalProperties:false,properties:{date:{type:'string'},start_time:{type:'string',description:'HH:mm:00'},duration_min:{type:'integer',minimum:1,maximum:900},room:{type:['string','null']},instructor:{type:['string','null']}}},reason:{type:['string','null'],maxLength:1000}},required:['event_id','action','patch']},
  {name:'schedule.delete_override',description:'Prepare restoration of the source event; user must confirm in the app.',properties:{event_id:{type:'string'}},required:['event_id']},
].map(t=>({name:t.name,description:t.description,inputSchema:{type:'object',properties:t.properties,required:t.required,additionalProperties:false}}));
module.exports={tools};
