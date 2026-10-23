"use strict";
const crypto=require('node:crypto');
// Unambiguous alphabet: codes are typed by hand (calendar pairing, role invites).
const CODE_ALPHABET='ABCDEFGHJKMNPQRSTVWXYZ23456789';
function newCode(){
  const raw=Array.from({length:12},()=>CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
  return raw.match(/.{4}/g).join('-');
}
// The 12 code characters without separators, or null when the input is not a code.
function rawCode(code){
  const raw=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  return raw.length===12&&[...raw].every(char=>CODE_ALPHABET.includes(char))?raw:null;
}
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
module.exports={newCode,rawCode,sha256};
