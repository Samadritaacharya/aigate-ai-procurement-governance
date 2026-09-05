import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { screen, type UseCase } from '../lib/engine.ts';
import { validatePayload } from '../lib/validation.ts';

const here=dirname(fileURLToPath(import.meta.url));
const fixtures=JSON.parse(readFileSync(join(here,'../lib/evaluation_cases.json'),'utf8'));
const hashes=JSON.parse(readFileSync(join(here,'../lib/evaluation_hashes.json'),'utf8'));
const SNAPSHOT_KEYS=['risk_band','decision','approval_route','evidence_score','vendor_score','readiness_score','annual_benefit_eur','annual_net_value_eur','roi_pct','payback_months','missing_controls'];

function stable(value:any):string {
  if(Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if(value && typeof value==='object'){
    return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function hash(value:any){return createHash('sha256').update(stable(value)).digest('hex')}

test('32 shared cases match expected band and decision',()=>{assert.equal(fixtures.length,32);for(const c of fixtures){const r=screen(c.input as UseCase);assert.equal(r.risk_band,c.expected.risk_band,c.id);assert.equal(r.decision,c.expected.decision,c.id)}});
test('prohibited indicators outrank high-risk indicators',()=>{const r=screen({name:'mixed',purpose:'A sufficiently long mixed-purpose description.',employment_decisions:true,social_scoring:true});assert.equal(r.risk_band,'prohibited-review');assert.equal(r.decision,'BLOCK_AND_LEGAL_REVIEW')});
test('external vendor score rises with evidence',()=>{const low=screen({name:'vendor',purpose:'A sufficiently long external vendor use case.',vendor:'Vendor X'});const high=screen({name:'vendor',purpose:'A sufficiently long external vendor use case.',vendor:'Vendor X',contract_dpa:true,subprocessor_inventory:true,model_card_or_system_card:true,exit_plan:true});assert.ok(high.vendor_score>low.vendor_score)});
test('value case is deterministic',()=>{const r=screen({name:'value',purpose:'A sufficiently long value-case description.',annual_volume:10000,hours_saved_per_case:.1,value_per_hour_eur:50,implementation_cost_eur:20000,annual_run_cost_eur:10000});assert.equal(r.annual_benefit_eur,50000);assert.equal(r.annual_net_value_eur,40000);assert.equal(r.payback_months,6)});
test('validation rejects unknown and type-confused fields',()=>{assert.throws(()=>validatePayload({name:'x',purpose:'A sufficiently long use case purpose.',admin_override:true}));assert.throws(()=>validatePayload({name:'x',purpose:'A sufficiently long use case purpose.',employment_decisions:'false'}));assert.throws(()=>validatePayload({name:'x',purpose:'A sufficiently long use case purpose.',hours_saved_per_case:99}))});
test('evidence toggles close high-risk gaps',()=>{const r=screen({name:'hiring',purpose:'A sufficiently long employment decision support use case.',employment_decisions:true,formal_risk_management_file:true,legal_classification_review:true,incident_process:true,exit_plan:true});assert.ok(!r.missing_controls.includes('Formal risk-management file'));assert.ok(!r.missing_controls.includes('Legal/compliance classification review'))});
test('TypeScript policy matches Python output hashes across 32 cases',()=>{const expected=new Map(hashes.map((x:any)=>[x.id,x.sha256]));for(const c of fixtures){const r:any=screen(c.input as UseCase);const subset=Object.fromEntries(SNAPSHOT_KEYS.map(k=>[k,r[k]]));assert.equal(hash(subset),expected.get(c.id),c.id)}});
