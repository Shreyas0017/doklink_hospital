export type BedStatus = "available" | "occupied" | "maintenance";
export type Ward = "General" | "ICU" | "Pediatric" | "Maternity" | "Emergency";
export type PatientStatus = "Admitted" | "Discharged";
export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Partial";
export type DocumentType = "Report" | "Prescription" | "Lab Result" | "Discharge Summary";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export interface Bed {
  id: string;
  bedNumber: string;
  ward: Ward;
  status: BedStatus;
  patientId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  admissionDate: string;
  dischargeDate?: string;
  diagnosis: string;
  assignedBed?: string;
  status: PatientStatus;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string;
  medications: string;
}

export interface Document {
  id: string;
  patientId: string;
  type: DocumentType;
  name: string;
  date: string;
  url: string;
}

export interface DailyExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  approvedAmount?: number;
  notes?: string;
}

export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  policyNumber: string;
  insurer: string;
  claimAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  status: ClaimStatus;
  submissionDate: string;
  diagnosis: string;
  treatment: string;
  expenses: DailyExpense[];
  approvalHistory: ApprovalHistory[];
}

export interface ApprovalHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
}

export interface Activity {
  id: string;
  type: "admission" | "discharge" | "claim";
  description: string;
  time: string;
}
