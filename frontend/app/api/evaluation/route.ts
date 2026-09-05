import { NextResponse } from 'next/server';
import fixtures from '../../../lib/evaluation_cases.json';
import { screen, type UseCase } from '../../../lib/engine';
export async function GET(){let band=0,decision=0;const details=fixtures.map(c=>{const r=screen(c.input as UseCase);const b=r.risk_band===c.expected.risk_band,d=r.decision===c.expected.decision;band+=Number(b);decision+=Number(d);return {id:c.id,band_ok:b,decision_ok:d}});return NextResponse.json({cases:fixtures.length,risk_band_accuracy:band/fixtures.length,decision_accuracy:decision/fixtures.length,details},{headers:{'Cache-Control':'public, max-age=300'}})}
