import { FamilyMember, HealthRecord, Prescription, Appointment, HealthRecordType, MedicalDocument, DocumentType, SharedAccess, AIInsight, InsurancePolicy, MedicalBill, User } from './types.ts';

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'John Doe', age: 45, gender: 'Male', relation: 'Father', avatarUrl: 'https://picsum.photos/seed/johndoe/200' },
  { id: '2', name: 'Jane Doe', age: 42, gender: 'Female', relation: 'Mother', avatarUrl: 'https://picsum.photos/seed/janedoe/200' },
  { id: '3', name: 'Mike Doe', age: 18, gender: 'Male', relation: 'Son', avatarUrl: 'https://picsum.photos/seed/mikedoe/200' },
  { id: '4', name: 'Emily Doe', age: 15, gender: 'Female', relation: 'Daughter', avatarUrl: 'https://picsum.photos/seed/emilydoe/200' },
];

export const MOCK_USER: User = {
    id: '2', // Corresponds to Jane Doe in MOCK_FAMILY_MEMBERS
    name: 'Jane Doe',
    email: 'jane.doe@kinwell.app',
    avatarUrl: 'https://picsum.photos/seed/janedoe/200',
};


const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const twoWeeksAgo = new Date();
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

export const MOCK_HEALTH_RECORDS: HealthRecord[] = [
  // John Doe
  { id: 'hr1', memberId: '1', type: HealthRecordType.BloodPressure, value: 125, value2: 82, date: threeMonthsAgo.toISOString(), notes: 'Annual check-up' },
  { id: 'hr2', memberId: '1', type: HealthRecordType.BloodPressure, value: 122, value2: 80, date: oneMonthAgo.toISOString() },
  { id: 'hr3', memberId: '1', type: HealthRecordType.Cholesterol, value: 190, date: threeMonthsAgo.toISOString() },
  { id: 'hr4', memberId: '1', type: HealthRecordType.BMI, value: 24.5, date: threeMonthsAgo.toISOString() },
  { id: 'hr11', memberId: '1', type: HealthRecordType.BloodPressure, value: 120, value2: 78, date: new Date().toISOString() },

  // Jane Doe
  { id: 'hr5', memberId: '2', type: HealthRecordType.BloodPressure, value: 115, value2: 75, date: twoMonthsAgo.toISOString() },
  { id: 'hr6', memberId: '2', type: HealthRecordType.BloodSugar, value: 95, date: twoMonthsAgo.toISOString(), notes: 'Fasting' },
  { id: 'hr7', memberId: '2', type: HealthRecordType.BMI, value: 22.1, date: twoMonthsAgo.toISOString() },
  { id: 'hr12', memberId: '2', type: HealthRecordType.HeartRate, value: 68, date: new Date().toISOString() },


  // Mike Doe
  { id: 'hr8', memberId: '3', type: HealthRecordType.BMI, value: 21.5, date: oneMonthAgo.toISOString(), notes: 'Sports physical' },
  
  // Emily Doe
  { id: 'hr9', memberId: '4', type: HealthRecordType.HeartRate, value: 75, date: twoWeeksAgo.toISOString() },
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'p1', memberId: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2023-01-15' },
  { id: 'p2', memberId: '2', name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', startDate: '2022-06-01' },
];

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

const inThreeWeeks = new Date();
inThreeWeeks.setDate(inThreeWeeks.getDate() + 21);

const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);


export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', memberId: '4', title: 'Dentist Check-up', date: nextWeek.toISOString(), doctor: 'Dr. Smiles', location: 'Downtown Dental Clinic', notes: 'Routine cleaning.' },
  { id: 'a2', memberId: '1', title: 'Cardiologist Follow-up', date: inThreeWeeks.toISOString(), doctor: 'Dr. Hart', location: 'City Heart Center' },
  { id: 'a3', memberId: '2', title: 'Annual Physical', date: nextMonth.toISOString(), doctor: 'Dr. Welby', location: 'General Hospital' },
  { id: 'a4', memberId: '3', title: 'Orthopedist Visit', date: '2024-05-10T10:00:00.000Z', doctor: 'Dr. Bones', location: 'Sports Medicine Clinic', notes: 'Follow up on knee injury' },
];


export const MOCK_MEDICAL_DOCUMENTS: MedicalDocument[] = [
    { id: 'doc1', memberId: '1', name: 'Cholesterol Test Results', type: DocumentType.LabResult, uploadDate: threeMonthsAgo.toISOString(), fileUrl: '#' },
    { id: 'doc2', memberId: '2', name: 'Health Insurance Card', type: DocumentType.InsuranceCard, uploadDate: new Date('2024-01-01').toISOString(), fileUrl: '#' },
    { id: 'doc3', memberId: '4', name: 'Vaccination History', type: DocumentType.VaccinationRecord, uploadDate: new Date('2023-08-15').toISOString(), fileUrl: '#' },
];

export const MOCK_SHARED_ACCESS: SharedAccess[] = [
    { id: 'sa1', memberId: '1', sharedWithName: 'Dr. Hart', sharedWithEmail: 'dr.hart@cityheart.com', shareDate: oneMonthAgo.toISOString(), accessLink: `https://familyhealthhub.app/shared/${crypto.randomUUID()}` },
];

export const MOCK_AI_INSIGHTS: AIInsight[] = [
    {
        id: 'insight1',
        memberId: '1',
        title: 'Blood Pressure Observation',
        description: "John's systolic blood pressure has shown a slight downward trend over the past 3 months, which is a positive sign.",
        category: 'Positive Trend',
        date: new Date().toISOString()
    }
];

export const MOCK_INSURANCE_POLICIES: InsurancePolicy[] = [
    {
        id: 'policy1',
        provider: 'Blue Shield',
        planName: 'Family PPO Plan',
        policyNumber: 'XF123456789',
        groupNumber: 'G-98765',
        memberIds: ['1', '2', '3', '4'],
        deductible: 5000,
        deductibleMet: 1250.75,
    }
];

export const MOCK_MEDICAL_BILLS: MedicalBill[] = [
    {
        id: 'bill1',
        memberId: '1',
        provider: 'City Heart Center',
        serviceDate: inThreeWeeks.toISOString(),
        description: 'Cardiologist Follow-up Visit',
        amount: 250,
        status: 'Pending Insurance',
        insurancePolicyId: 'policy1'
    },
    {
        id: 'bill2',
        memberId: '4',
        provider: 'Downtown Dental Clinic',
        serviceDate: nextWeek.toISOString(),
        description: 'Routine Cleaning & Check-up',
        amount: 150,
        status: 'Due',
        insurancePolicyId: 'policy1'
    },
     {
        id: 'bill3',
        memberId: '2',
        provider: 'General Hospital Labs',
        serviceDate: twoMonthsAgo.toISOString(),
        description: 'Annual Blood Work',
        amount: 320.75,
        status: 'Paid',
        insurancePolicyId: 'policy1'
    }
];