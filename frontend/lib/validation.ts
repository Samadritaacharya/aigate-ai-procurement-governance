import type { UseCase } from './engine';

export const STRING_FIELDS = ['name','purpose','business_unit','role','vendor','model','domain','users'] as const;
export const NUMERIC_FIELDS = ['annual_volume','hours_saved_per_case','value_per_hour_eur','implementation_cost_eur','annual_run_cost_eur'] as const;
export const BOOLEAN_FIELDS = [
  'personal_data','special_category_data','children_or_vulnerable_people','employment_decisions','education_admissions','essential_services_decisions',
  'biometric_identification','biometric_sensitive_categorization','workplace_emotion_recognition','social_scoring','manipulative_or_subliminal',
  'predictive_policing_profile_only','critical_infrastructure_safety','regulated_product_safety_component','chatbot_or_human_interaction','synthetic_media_generation',
  'automated_external_decision','human_oversight','logging_enabled','evaluation_plan','incident_process','dpia_or_privacy_review','security_review','contract_dpa',
  'eu_data_residency','subprocessor_inventory','model_card_or_system_card','exit_plan','ai_disclosure_ready','synthetic_content_marking_ready',
  'formal_risk_management_file','legal_classification_review','appeal_process','access_control_evidence','data_minimisation_policy'
] as const;
const ALLOWED=new Set<string>([...STRING_FIELDS,...NUMERIC_FIELDS,...BOOLEAN_FIELDS]);
const LIMITS:Record<string,[number,number]>={annual_volume:[0,10_000_000],hours_saved_per_case:[0,24],value_per_hour_eur:[0,10_000],implementation_cost_eur:[0,100_000_000],annual_run_cost_eur:[0,100_000_000]};

export function validatePayload(input:unknown):UseCase{
  if(!input||Array.isArray(input)||typeof input!=='object')throw new Error('JSON object required');
  const x=input as Record<string,unknown>; const unknown=Object.keys(x).filter(k=>!ALLOWED.has(k)); if(unknown.length)throw new Error(`Unknown fields: ${unknown.sort().join(', ')}`);
  for(const k of STRING_FIELDS)if(k in x&&typeof x[k]!=='string')throw new Error(`${k} must be a string`);
  const name=String(x.name??'').trim(),purpose=String(x.purpose??'').trim(); if(!name)throw new Error('name is required'); if(name.length>200)throw new Error('name must be 200 characters or fewer'); if(purpose.length<20)throw new Error('purpose must be at least 20 characters'); if(purpose.length>5000)throw new Error('purpose must be 5000 characters or fewer');
  for(const k of BOOLEAN_FIELDS)if(k in x&&typeof x[k]!=='boolean')throw new Error(`${k} must be a boolean`);
  for(const k of NUMERIC_FIELDS){if(!(k in x))continue;const v=x[k];if(typeof v!=='number'||!Number.isFinite(v))throw new Error(`${k} must be a finite number`);const [lo,hi]=LIMITS[k];if(v<lo||v>hi)throw new Error(`${k} must be between ${lo} and ${hi}`);if(k==='annual_volume'&&!Number.isInteger(v))throw new Error('annual_volume must be a whole number')}
  return {...x,name,purpose} as UseCase;
}
