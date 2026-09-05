import { NextResponse } from 'next/server';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({status:'ok',service:'aigate-command-center',paid_api_required:false,storage:'browser-local-only',policy:'deterministic-2026.09'},{headers:{'Cache-Control':'no-store'}})}
