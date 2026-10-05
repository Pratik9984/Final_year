export type Language = 'en' | 'mr';
export type UserRole = 'citizen' | 'officer' | 'verifier' | 'ops' | 'blockchain' | 'architecture';
export type CitizenSubTab = 'services' | 'vault' | 'mycerts' | 'schemes' | 'track' | 'renew';

export interface AuthUserSession {
  user_id: string;
  role: string;
  full_name_en: string;
  full_name_mr?: string;
  masked_aadhaar: string;
  district: string;
  taluka?: string;
  village?: string;
  mobile?: string;
  auth_method: 'DIGILOCKER_OAUTH2_PKCE' | 'UIDAI_AADHAAR_OTP_EKYC' | 'OFFICER_PKI_HARDWARE';
  synced_documents_count?: number;
  mahavault_synced?: string[];
  access_token: string;
  tokenized_adv_id?: string;
}

export interface ServiceItem {
  code: string;
  name_en: string;
  name_mr: string;
  dept_en: string;
  dept_mr: string;
  icon: string;
  sla: string;
  vault_deps: string[];
  auto_eligible: boolean;
}

export interface VaultDocItem {
  id: string;
  title: string;
  type: string;
  hash: string;
  source: string;
  metadata: Record<string, string>;
}

export interface CertificateItem {
  id: string;
  certificate_number: string;
  service_code: string;
  beneficiary_name: string;
  issued_at: string;
  valid_until?: string;
  is_revoked: boolean;
  merkle_root_hash: string;
  pdf_url: string;
  qr_payload: string;
  credential_payload?: Record<string, any>;
}

export interface SchemeItem {
  id: string;
  name_en: string;
  name_mr: string;
  department: string;
  benefit_value: string;
  status: 'ELIGIBLE' | 'INELIGIBLE';
  reasons: string[];
}

export interface OfficerQueueItem {
  id: string;
  application_number: string;
  service_code: string;
  submitted_at: string;
  sla_due_at: string;
  sla_remaining_formatted: string;
  is_sla_breached: boolean;
  is_renewal: boolean;
  ai_risk_score: string;
  opa_policy_result: Record<string, any>;
}

export interface VerificationResult {
  status: string;
  verification_result?: string;
  is_authentic?: boolean;
  certificate_number?: string;
  service?: string;
  beneficiary_name?: string;
  beneficiary?: string;
  issued_at?: string;
  issued_date?: string;
  issuing_authority?: {
    officer_name: string;
    role: string;
    district: string;
  };
  merkle_root_ledger_hash?: string;
  ledger_merkle_root?: string;
  is_revoked?: boolean;
  trust_badge?: string;
  message?: string;
}

export interface AnomalyReport {
  alert_id: string;
  severity: string;
  detected_at: string;
  anomaly_type: string;
  affected_department: string;
  affected_district: string;
  baseline_processing_time_hours: number;
  current_processing_time_hours: number;
  isolated_stage: string;
  root_cause_analysis: string;
  automated_remediation_action: string;
}
