import { NextRequest, NextResponse } from 'next/server';
import { screen } from '../../../lib/engine';
import { validatePayload } from '../../../lib/validation';

export const runtime='nodejs'; export const dynamic='force-dynamic';
const MAX=32_000;
export async function GET(){return NextResponse.json({status:'ok',service:'aigate-command-center',paid_api_required:false,policy:'deterministic-2026.09'});}
export async function POST(req:NextRequest){
  const raw=await req.text(); if(new TextEncoder().encode(raw).byteLength>MAX)return NextResponse.json({error:'request too large'},{status:413});
  let body:unknown; try{body=JSON.parse(raw)}catch{return NextResponse.json({error:'valid JSON object required'},{status:400});}
  try{const uc=validatePayload(body);return NextResponse.json(screen(uc),{headers:{'Cache-Control':'no-store','X-AIGate-Policy':'deterministic-2026.09'}})}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'invalid request'},{status:422})}
}
