export type RiskBand = 'prohibited-review' | 'high-risk-candidate' | 'transparency' | 'minimal';
export type Decision = 'BLOCK_AND_LEGAL_REVIEW' | 'HUMAN_APPROVAL_REQUIRED' | 'CONTROL_REVIEW' | 'STANDARD_REVIEW';

export type UseCase = {
  name: string; purpose: string; business_unit?: string; role?: string; vendor?: string; model?: string; domain?: string; users?: string;
  annual_volume?: number; hours_saved_per_case?: number; value_per_hour_eur?: number; implementation_cost_eur?: number; annual_run_cost_eur?: number;
  personal_data?: boolean; special_category_data?: boolean; children_or_vulnerable_people?: boolean; employment_decisions?: boolean;
  education_admissions?: boolean; essential_services_decisions?: boolean; biometric_identification?: boolean;
  biometric_sensitive_categorization?: boolean; workplace_emotion_recognition?: boolean; social_scoring?: boolean;
  manipulative_or_subliminal?: boolean; predictive_policing_profile_only?: boolean; critical_infrastructure_safety?: boolean;
  regulated_product_safety_component?: boolean; chatbot_or_human_interaction?: boolean; synthetic_media_generation?: boolean;
  automated_external_decision?: boolean; human_oversight?: boolean; logging_enabled?: boolean; evaluation_plan?: boolean;
  incident_process?: boolean; dpia_or_privacy_review?: boolean; security_review?: boolean; contract_dpa?: boolean;
  eu_data_residency?: boolean; subprocessor_inventory?: boolean; model_card_or_system_card?: boolean; exit_plan?: boolean;
  ai_disclosure_ready?: boolean; synthetic_content_marking_ready?: boolean; formal_risk_management_file?: boolean; legal_classification_review?: boolean;
  appeal_process?: boolean; access_control_evidence?: boolean; data_minimisation_policy?: boolean;
};

export type Result = {
  risk_band: RiskBand; decision: Decision; reasons: string[]; required_controls: string[]; missing_controls: string[]; approval_route: string[];
  evidence_score: number; vendor_score: number; readiness_score: number; annual_benefit_eur: number; annual_net_value_eur: number;
  roi_pct: number; payback_months: number | null; policy_version: string; legal_notice: string; ai_summary: string; evidence_graph: {from:string;to:string;type:string}[];
};

const prohibited: [keyof UseCase,string][] = [
  ['social_scoring','Social-scoring indicator requires an immediate legal/compliance stop.'],
  ['manipulative_or_subliminal','Manipulative or subliminal influence indicator requires legal review.'],
  ['biometric_sensitive_categorization','Sensitive biometric categorisation indicator requires legal review.'],
  ['workplace_emotion_recognition','Workplace emotion-recognition indicator requires legal review.'],
  ['predictive_policing_profile_only','Profile-only predictive-policing indicator requires legal review.']
];
const high: [keyof UseCase,string][] = [
  ['employment_decisions','Employment decision/support use case is a high-risk candidate.'],
  ['education_admissions','Education admission/assessment use case is a high-risk candidate.'],
  ['essential_services_decisions','Essential-services eligibility/access decision is a high-risk candidate.'],
  ['biometric_identification','Biometric identification use case is a high-risk candidate.'],
  ['critical_infrastructure_safety','Critical-infrastructure safety use case is a high-risk candidate.'],
  ['regulated_product_safety_component','Regulated-product safety component is a high-risk candidate.']
];

function pyRound(value:number,digits=0){const f=10**digits,x=value*f,lo=Math.floor(x),frac=x-lo;let n:number;if(Math.abs(frac-.5)<1e-12)n=lo%2===0?lo:lo+1;else n=Math.round(x);return n/f;}

const b=(uc:UseCase,k:keyof UseCase,d=false)=> typeof uc[k]==='boolean' ? Boolean(uc[k]) : d;
const s=(uc:UseCase,k:keyof UseCase,d:string)=> typeof uc[k]==='string' ? String(uc[k]) : d;
const n=(uc:UseCase,k:keyof UseCase,d:number)=> typeof uc[k]==='number' ? Number(uc[k]) : d;

export function classify(uc:UseCase):[RiskBand,string[]]{
  const p=prohibited.filter(([k])=>b(uc,k)).map(([,r])=>r); if(p.length) return ['prohibited-review',p];
  const h=high.filter(([k])=>b(uc,k)).map(([,r])=>r); if(h.length) return ['high-risk-candidate',h];
  const t:string[]=[]; if(b(uc,'chatbot_or_human_interaction'))t.push('Human-interaction AI creates transparency-notice obligations.');
  if(b(uc,'synthetic_media_generation'))t.push('Synthetic-content generation creates transparency/marking obligations.');
  return t.length?['transparency',t]:['minimal',['No prohibited/high-risk/transparency trigger was detected by this screening policy.']];
}
function controls(uc:UseCase,band:RiskBand){
  const vendor=s(uc,'vendor','Internal / TBD'); const c=['Named business owner','Documented purpose and scope','Rollback/exit path'];
  if(vendor!=='Internal / TBD')c.push('Vendor security evidence','DPA / contractual data terms','Subprocessor inventory');
  if(b(uc,'personal_data'))c.push('Privacy review','Data minimisation and retention rules');
  if(b(uc,'special_category_data')||b(uc,'children_or_vulnerable_people'))c.push('DPIA / heightened privacy review','Access-control evidence');
  if(band==='high-risk-candidate')c.push('Formal risk-management file','Human-oversight design','Technical logging','Evaluation evidence','Legal/compliance classification review');
  if(band==='transparency')c.push('User-facing AI disclosure','Synthetic-content marking policy where applicable');
  if(band==='prohibited-review')c.push('Immediate legal/compliance review','No production release until prohibition analysis is closed');
  if(b(uc,'automated_external_decision'))c.push('Human escalation path','Decision contestability / appeal process');
  c.push('Monitoring and incident process'); return [...new Set(c)];
}
function missing(uc:UseCase,c:string[]){
  const checks:Record<string,boolean>={
    'Human-oversight design':b(uc,'human_oversight',true),'Technical logging':b(uc,'logging_enabled',true),'Evaluation evidence':b(uc,'evaluation_plan',true),
    'Monitoring and incident process':b(uc,'incident_process'), 'Privacy review':b(uc,'dpia_or_privacy_review'), 'DPIA / heightened privacy review':b(uc,'dpia_or_privacy_review'),
    'Vendor security evidence':b(uc,'security_review',true),'DPA / contractual data terms':b(uc,'contract_dpa'),'Subprocessor inventory':b(uc,'subprocessor_inventory'),
    'Rollback/exit path':b(uc,'exit_plan'),'User-facing AI disclosure':b(uc,'ai_disclosure_ready'),'Synthetic-content marking policy where applicable':b(uc,'synthetic_content_marking_ready'),'Formal risk-management file':b(uc,'formal_risk_management_file'),
    'Legal/compliance classification review':b(uc,'legal_classification_review'),'Immediate legal/compliance review':false,'No production release until prohibition analysis is closed':false,
    'Decision contestability / appeal process':b(uc,'appeal_process'),'Human escalation path':b(uc,'human_oversight',true),'Data minimisation and retention rules':b(uc,'data_minimisation_policy'),
    'Access-control evidence':b(uc,'access_control_evidence'),'Named business owner':s(uc,'business_unit','Digital Transformation').trim().length>0,'Documented purpose and scope':uc.purpose.trim().length>=20
  }; return c.filter(x=>x in checks&&!checks[x]);
}
function route(uc:UseCase,band:RiskBand){const r=['Business Owner'];if(s(uc,'vendor','Internal / TBD')!=='Internal / TBD')r.push('Procurement');if(b(uc,'personal_data')||b(uc,'special_category_data'))r.push('Privacy / DPO');if(b(uc,'security_review',true)||s(uc,'vendor','Internal / TBD')!=='Internal / TBD')r.push('Security');if(['prohibited-review','high-risk-candidate'].includes(band))r.push('Legal / AI Governance');r.push('Release Authority');return [...new Set(r)];}
function vendorScore(uc:UseCase){if(s(uc,'vendor','Internal / TBD')==='Internal / TBD')return 70;const e=[b(uc,'security_review',true),b(uc,'contract_dpa'),b(uc,'eu_data_residency',true),b(uc,'subprocessor_inventory'),b(uc,'model_card_or_system_card'),b(uc,'exit_plan')];return pyRound(e.filter(Boolean).length/e.length*100);}
export function screen(uc:UseCase):Result{
  const [band,reasons]=classify(uc), req=controls(uc,band), miss=missing(uc,req), approval=route(uc,band), ev=Math.max(0,Math.min(100,pyRound((req.length-miss.length)/Math.max(req.length,1)*100))), vs=vendorScore(uc);
  let decision:Decision='STANDARD_REVIEW',penalty=0;if(band==='prohibited-review'){decision='BLOCK_AND_LEGAL_REVIEW';penalty=40}else if(band==='high-risk-candidate'){decision='HUMAN_APPROVAL_REQUIRED';penalty=20}else if(band==='transparency'){decision='CONTROL_REVIEW';penalty=10}
  const readiness=Math.max(0,Math.min(100,pyRound(ev*.7+vs*.3-penalty)));
  const benefit=Math.max(0,n(uc,'annual_volume',10000)*n(uc,'hours_saved_per_case',.05)*n(uc,'value_per_hour_eur',55)); const run=Math.max(0,n(uc,'annual_run_cost_eur',12000)); const impl=Math.max(0,n(uc,'implementation_cost_eur',25000)); const net=benefit-run; const roi=impl>0?((benefit-run-impl)/impl*100):0; const monthly=net/12; const payback=monthly>0?impl/monthly:null;
  const vendor=s(uc,'vendor','Internal / TBD'), model=s(uc,'model','Unspecified'), bu=s(uc,'business_unit','Digital Transformation');
  const summary=`${uc.name} screened as ${band}. The deterministic policy routes it to ${decision}; readiness is ${readiness}/100. Priority evidence work: ${miss.slice(0,4).join(', ')||'no critical evidence gaps detected'}. Any model-generated explanation is advisory only and cannot change this policy decision.`;
  return {risk_band:band,decision,reasons,required_controls:req,missing_controls:miss,approval_route:approval,evidence_score:ev,vendor_score:vs,readiness_score:readiness,annual_benefit_eur:pyRound(benefit,2),annual_net_value_eur:pyRound(net,2),roi_pct:pyRound(roi,1),payback_months:payback===null?null:pyRound(payback,1),policy_version:'2026.09',legal_notice:'Decision-support screening only; not a legal determination.',ai_summary:summary,evidence_graph:[{from:'Use Case',to:bu,type:'owned-by'},{from:'Use Case',to:vendor,type:'uses-vendor'},{from:vendor,to:model,type:'provides-model'},{from:'Use Case',to:band,type:'screened-as'},{from:band,to:decision,type:'routes-to'},...approval.map(to=>({from:decision,to,type:'approval'}))]};
}
