export enum HealthRecordType {
  BloodPressure = 'Blood Pressure',
  BloodSugar = 'Blood Sugar',
  Cholesterol = 'Cholesterol',
  BMI = 'BMI',
  HeartRate = 'Heart Rate',
  BloodOxygen = 'Blood Oxygen',
}

export interface HealthRecord {
  id: string;
  memberId: string;
  type: HealthRecordType;
  value: number;
  value2?: number; // For systolic/diastolic blood pressure
  date: string; // ISO string format
  notes?: string;
}

export interface Prescription {
  id: string;
  memberId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO string format
  endDate?: string; // ISO string format
}

export interface Appointment {
  id: string;
  memberId: string;
  title: string;
  date: string; // ISO string format
  doctor: string;
  location: string;
  notes?: string;
  reminderOffset?: number; // Minutes before appointment to send reminder
}

export interface FamilyMember {
  id:string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  relation: string;
  avatarUrl: string;
}

// Represents the currently logged-in user
export interface User {
  id: string; // Corresponds to a FamilyMember id
  name: string;
  email: string;
  avatarUrl: string;
}

export enum View {
  Dashboard = 'Dashboard',
  Family = 'Family',
  Appointments = 'Appointments',
  Insurance = 'Insurance',
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export enum DocumentType {
  LabResult = 'Lab Result',
  VaccinationRecord = 'Vaccination Record',
  InsuranceCard = 'Insurance Card',
  XRayReport = 'X-Ray Report',
  Other = 'Other',
}

export interface MedicalDocument {
  id: string;
  memberId: string;
  name: string;
  type: DocumentType;
  uploadDate: string; // ISO string format
  fileUrl: string; // In a real app, this would be a URL. Here, we can use a data URL for simplicity.
}

export interface SharedAccess {
  id: string;
  memberId: string;
  sharedWithName: string;
  sharedWithEmail: string;
  shareDate: string; // ISO string format
  accessLink: string;
}

// New Types for AI Insights and Insurance Hub

export interface AIInsight {
  id: string;
  memberId: string;
  title: string;
  description: string;
  category: 'Positive Trend' | 'Observation' | 'Needs Attention';
  date: string; // ISO string format
}

export interface InsurancePolicy {
  id: string;
  provider: string;
  planName: string;
  policyNumber: string;
  groupNumber?: string;
  memberIds: string[];
  deductible: number;
  deductibleMet: number;
}

export interface MedicalBill {
  id: string;
  memberId: string;
  provider: string;
  serviceDate: string; // ISO string format
  description: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Pending Insurance';
  insurancePolicyId?: string;
}