"use strict";
const crypto=require('node:crypto');
const {getFirebaseAdminAuth}=require('./firebaseAdmin');
const {fail,keys,text}=require('./schedule');
function encryptionKey() {
  const secret=process.env.SCHEDULE_TOOL_SECRET;
  if(!secret||secret.length<32)fail(503,'AI_NOT_CONFIGURED','Brak konfiguracji szyfrowania kluczy.');
  return crypto.hkdfSync('sha256',secret,'schedule-ai-credentials','aes-256-gcm-v1',32);
}
function encrypt(uid,key) {
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',encryptionKey(),iv);
  cipher.setAAD(Buffer.from(uid));
  const ciphertext=Buffer.concat([cipher.update(key,'utf8'),cipher.final()]);
  return {version:1,iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64'),tag:cipher.getAuthTag().toString('base64')};
}
function decrypt(uid,record) {
  if(!record)return '';
  const decipher=crypto.createDecipheriv('aes-256-gcm',encryptionKey(),Buffer.from(record.iv,'base64'));
  decipher.setAAD(Buffer.from(uid));decipher.setAuthTag(Buffer.from(record.tag,'base64'));
  return Buffer.concat([decipher.update(Buffer.from(record.ciphertext,'base64')),decipher.final()]).toString('utf8');
}
function document(uid) {
  getFirebaseAdminAuth();
  const {getFirestore}=require('firebase-admin/firestore');
  const collection=process.env.SCHEDULE_ENVIRONMENT==='staging'?'scheduleAiStagingCredentials':'scheduleAiCredentials';
  return getFirestore().collection(collection).doc(uid);
}
function publicSettings(row={}) {return {provider:row.provider||'n8n',model:row.model||'',local_endpoint:row.local_endpoint||'',
  local_endpoint_id:row.local_endpoint_id||'',local_model:row.local_model||'',local_memory:row.local_memory===true,has_api_key:Boolean(row.encrypted_key)};}
async function read(uid) {const snapshot=await document(uid).get();return snapshot.exists?snapshot.data():{};}
async function save(uid,args) {
  keys(args,['provider','model','local_endpoint','local_endpoint_id','local_model','local_memory','api_key','remove_api_key']);
  if(!['n8n','odysseus'].includes(args.provider))fail(422,'INVALID_PROVIDER','Wybierz API albo lokalnego agenta.');
  text(args.model,128);text(args.local_endpoint,2048);text(args.api_key,4096);
  text(args.local_endpoint_id,128);text(args.local_model,128);
  if(args.local_memory!==undefined&&typeof args.local_memory!=='boolean')fail(422,'INVALID_ARGUMENTS','Nieprawidłowa opcja pamięci lokalnej.');
  if(args.api_key&&!args.api_key.trim())fail(422,'INVALID_KEY','Klucz nie może zawierać samych spacji.');
  if(args.remove_api_key!==undefined&&typeof args.remove_api_key!=='boolean')fail(422,'INVALID_ARGUMENTS','Nieprawidłowe ustawienia.');
  if(args.local_endpoint){
    let url;try{url=new URL(args.local_endpoint);}catch{fail(422,'INVALID_ENDPOINT','Nieprawidłowy adres lokalnego adaptera.');}
    if(url.username||url.password||url.search||url.hash||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))fail(422,'INVALID_ENDPOINT','Użyj HTTPS albo adresu localhost.');
  }
  const ref=document(uid);
  return ref.firestore.runTransaction(async transaction=>{
    const previous=(await transaction.get(ref)).data()||{};
    const row={provider:args.provider,model:args.model||'',local_endpoint:args.local_endpoint||'',
      local_endpoint_id:args.local_endpoint_id||'',local_model:args.local_model||'',local_memory:args.local_memory===true,updated_at:new Date().toISOString()};
    if(!args.remove_api_key){
      if(args.api_key)row.encrypted_key=encrypt(uid,args.api_key.trim());
      else if(previous.encrypted_key)row.encrypted_key=previous.encrypted_key;
    }
    transaction.set(ref,row);return publicSettings(row);
  });
}
module.exports={encrypt,decrypt,read,save,publicSettings};
