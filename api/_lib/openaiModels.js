"use strict";
const {fail}=require('./schedule');

async function listModels(apiKey,request=fetch) {
  if(!apiKey)fail(422,'API_KEY_REQUIRED','Najpierw zapisz klucz API w ustawieniach AI.');
  let response;
  try {
    // Only key-based catalogue access: no prompts, history, UID or schedule data.
    response=await request('https://api.openai.com/v1/models',{
      method:'GET',redirect:'error',signal:AbortSignal.timeout(10000),
      headers:{Authorization:`Bearer ${apiKey}`},
    });
  } catch {fail(503,'MODEL_LIST_UNAVAILABLE','Nie udało się połączyć z listą modeli OpenAI. Spróbuj ponownie.');}
  if(response.status===401||response.status===403)fail(422,'MODEL_LIST_FORBIDDEN','Klucz nie pozwala pobrać listy modeli. Sprawdź klucz i jego uprawnienia lub wpisz nazwę ręcznie.');
  if(response.status===429)fail(429,'MODEL_LIST_RATE_LIMIT','OpenAI ograniczyło liczbę zapytań. Spróbuj ponownie później.');
  if(!response.ok)fail(503,'MODEL_LIST_UNAVAILABLE','Lista modeli OpenAI jest chwilowo niedostępna.');
  let payload;try{payload=await response.json();}catch{fail(503,'INVALID_MODEL_LIST','OpenAI zwróciło nieprawidłową listę modeli.');}
  if(!Array.isArray(payload?.data))fail(503,'INVALID_MODEL_LIST','OpenAI zwróciło nieprawidłową listę modeli.');
  const ids=[...new Set(payload.data.map(row=>row?.id).filter(id=>typeof id==='string'&&id.length>0&&id.length<=128))].sort();
  return ids.map(id=>({id}));
}
module.exports={listModels};
