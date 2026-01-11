import { ObjectId } from "mongodb";

/* =========================
   BASE / COMMON
========================= */

export interface BaseDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/* =========================
   ENUM / UNION TYPES
========================= */

export type Gender = "Male" | "Female" | "Other";

export type BedStatus = "available" | "occupied" | "maintenance";

export type Ward =
  | "General"
  | "ICU"
  | "Pediatric"
  | "Maternity"
  | "Emergency";

export type PatientStatus = "Admitted" | "Discharged";

export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Partial";

export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export type DocumentType =
  | "Report"
  | "Prescription"
  | "Lab Result"
  | "Discharge Summary";

export type ActivityType = "admission" | "discharge" | "claim";

/* =========================
   BED
========================= */

export interface Bed extends BaseDocument {
  hospitalId: ObjectId; // Multi-tenant field
  bedNumber: string;
  ward: Ward;
  status: BedStatus;
  patientId?: ObjectId;
}

/* =========================
   PATIENT
========================= */

export interface Patient extends BaseDocument {
  hospitalId: ObjectId; // Multi-tenant field
  name: string;
  age: number;
  gender: Gender;
  admissionDate: Date;
  dischargeDate?: Date;
  diagnosis: string;
  assignedBed?: ObjectId;
  status: PatientStatus;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact: string;
  bloodGroup?: string;
  allergies?: string;
  medications?: string;
}

/* =========================
   MEDICAL DOCUMENT
========================= */

export interface MedicalDocument extends BaseDocument {
  hospitalId: ObjectId; // Multi-tenant field
  patientId: ObjectId;
  type: DocumentType;
  name: string;
  date: Date;
  url: string;
}

/* =========================
   DAILY EXPENSE
========================= */

export interface DailyExpense {
  _id?: ObjectId;
  date: Date;
  description: string;
  amount: number;
  status: ExpenseStatus;
  approvedAmount?: number;
  notes?: string;
}

/* =========================
   APPROVAL HISTORY
========================= */

export interface ApprovalHistory {
  _id?: ObjectId;
  date: Date;
  description: string;
  amount: number;
  status: ExpenseStatus;
}

/* =========================
   CLAIM / INSURANCE
========================= */

export interface Claim extends BaseDocument {
  hospitalId: ObjectId; // Multi-tenant field
  patientId: ObjectId;
  patientName: string;
  policyNumber: string;
  insurer: string;
  claimAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  status: ClaimStatus;
  submissionDate: Date;
  diagnosis: string;
  treatment: string;
  expenses: DailyExpense[];
  approvalHistory: ApprovalHistory[];
}

/* =========================
   ACTIVITY LOG
========================= */

export interface Activity extends BaseDocument {
  hospitalId: ObjectId; // Multi-tenant field
  type: ActivityType;
  description: string;
  referenceId?: ObjectId;
  time: Date;
}

/* =========================
   HOSPITAL (Multi-Tenant)
========================= */

export interface Hospital extends BaseDocument {
  name: string;
  code: string; // Auto-generated unique identifier from hospital name (DB-safe, used as database name)
  address: string;
  phone: string;
  email: string; // Must be unique across all hospitals
  isActive: boolean;
  logo?: string;
  registrationNumber?: string;
}

/* =========================
   USER / AUTH (NextAuth)
========================= */

export type UserRole = "Admin" | "Doctor" | "Nurse" | "Staff";

export interface User extends BaseDocument {
  hospitalId: ObjectId; // Links user to hospital
  name: string;
  email: string; // Must be unique across all users in all hospitals
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  department?: string;
}

/* =========================
   FRONTEND SAFE TYPES
   (Used after mapping _id → id)
========================= */

export interface UIEntity {
  id: string;
}

export type UIPatient = Patient & UIEntity;
export type UIBed = Bed & UIEntity;
export type UIClaim = Claim & UIEntity;
