import React, { useState, useMemo, useEffect } from 'react';
import { 
  FamilyMember, HealthRecord, Prescription, Appointment, View, AppNotification, 
  MedicalDocument, SharedAccess, AIInsight, InsurancePolicy, MedicalBill, User 
} from './types.ts';
import { 
  MOCK_FAMILY_MEMBERS, MOCK_HEALTH_RECORDS, MOCK_PRESCRIPTIONS, MOCK_APPOINTMENTS, 
  MOCK_MEDICAL_DOCUMENTS, MOCK_SHARED_ACCESS, MOCK_AI_INSIGHTS, MOCK_INSURANCE_POLICIES, MOCK_MEDICAL_BILLS, MOCK_USER 
} from './constants.ts';
import Header from './components/Header.tsx';
import DashboardView from './components/DashboardView.tsx';
import FamilyView from './components/FamilyView.tsx';
import AppointmentsView from './components/AppointmentsView.tsx';
import InsuranceView from './components/InsuranceView.tsx';
import LoginView from './components/LoginView.tsx';
import MemberDetailView from './components/MemberDetailView.tsx';
import LandingView from './components/LandingView.tsx';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publicView, setPublicView] = useState<'landing' | 'login'>('landing');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(MOCK_HEALTH_RECORDS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>(MOCK_MEDICAL_DOCUMENTS);
  const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>(MOCK_SHARED_ACCESS);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(MOCK_AI_INSIGHTS);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(MOCK_INSURANCE_POLICIES);
  const [medicalBills, setMedicalBills] = useState<MedicalBill[]>(MOCK_MEDICAL_BILLS);

  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [viewingMember, setViewingMember] = useState<FamilyMember | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  useEffect(() => {
    const getMemberName = (memberId: string) => familyMembers.find(m => m.id === memberId)?.name || 'Someone';

    const interval = setInterval(() => {
      const now = Date.now();
      
      appointments.forEach(app => {
        if (app.reminderOffset && !shownNotificationIds.has(app.id)) {
          const appTime = new Date(app.date).getTime();
          const reminderTime = appTime - (app.reminderOffset * 60 * 1000);
          
          if (now >= reminderTime && now < reminderTime + 5 * 60 * 1000) {
            const memberName = getMemberName(app.memberId);
            const timeToApp = new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const notification: AppNotification = {
              id: app.id,
              title: `Reminder: ${app.title}`,
              message: `${memberName} has an appointment at ${timeToApp}.`,
              timestamp: now,
            };

            setNotifications(prev => [notification, ...prev]);
            
            if (notificationPermission === 'granted' && !document.hasFocus()) {
              new Notification(notification.title, { body: notification.message, icon: '/vite.svg' });
            }
            setShownNotificationIds(prev => new Set(prev).add(app.id));
          }
        }
      });
      
      if (Math.random() > 0.95 && familyMembers.length > 0) {
        const randomMember = familyMembers[Math.floor(Math.random() * familyMembers.length)];
        
        const newInsight: AIInsight = {
            id: `insight_${Date.now()}`,
            memberId: randomMember.id,
            title: "New Health Observation",
            description: `A new trend has been observed in ${randomMember.name}'s recent health data.`,
            category: 'Observation',
            date: new Date().toISOString()
        };
        
        if (!aiInsights.some(i => i.memberId === newInsight.memberId && i.title === newInsight.title)) {
             setAiInsights(prev => [newInsight, ...prev]);
             const notification: AppNotification = {
                id: newInsight.id,
                title: `New Insight for ${randomMember.name}`,
                message: newInsight.description,
                timestamp: Date.now(),
            };
            setNotifications(prev => [notification, ...prev]);
        }
      }

    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [appointments, notificationPermission, shownNotificationIds, familyMembers, healthRecords, aiInsights]);
  
  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPublicView('landing');
  };
  
  const handleViewProfile = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      setViewingMember(member);
      setActiveView(View.Family);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addAppointment = (newAppointment: Omit<Appointment, 'id'>) => {
    setAppointments(prev => [...prev, { ...newAppointment, id: Date.now().toString() }]);
  };

  const addHealthRecord = (newRecord: Omit<HealthRecord, 'id'>) => {
    setHealthRecords(prev => [...prev, { ...newRecord, id: Date.now().toString() }]);
  };
  
  const addPrescription = (newPrescription: Omit<Prescription, 'id'>) => {
    setPrescriptions(prev => [...prev, { ...newPrescription, id: Date.now().toString() }]);
  };

  const addFamilyMember = (newMember: Omit<FamilyMember, 'id' | 'avatarUrl'> & { avatarUrl?: string }) => {
    const member: FamilyMember = {
      ...newMember,
      id: Date.now().toString(),
      avatarUrl: newMember.avatarUrl || `https://picsum.photos/seed/${newMember.name.replace(/\s+/g, '')}/200`,
    };
    setFamilyMembers(prev => [...prev, member]);
  };

  const updateFamilyMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (viewingMember?.id === updatedMember.id) {
        setViewingMember(updatedMember);
    }
  };

  const addMedicalDocument = (newDocument: Omit<MedicalDocument, 'id'>) => {
    setMedicalDocuments(prev => [...prev, { ...newDocument, id: Date.now().toString() }]);
  };

  const deleteMedicalDocument = (documentId: string) => {
    setMedicalDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };
  
  const addSharedAccess = (newAccess: Omit<SharedAccess, 'id' | 'shareDate' | 'accessLink'>) => {
    const access: SharedAccess = {
      ...newAccess,
      id: Date.now().toString(),
      shareDate: new Date().toISOString(),
      accessLink: `https://kinwell.app/shared/${crypto.randomUUID()}`
    };
    setSharedAccess(prev => [...prev, access]);
    return access;
  };

  const revokeSharedAccess = (accessId: string) => {
    setSharedAccess(prev => prev.filter(access => access.id !== accessId));
  };
  
  const addOrUpdatePolicy = (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => {
    if ('id' in policy) {
      setInsurancePolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    } else {
      setInsurancePolicies(prev => [...prev, { ...policy, id: Date.now().toString() }]);
    }
  };
  
  const addOrUpdateBill = (bill: Omit<MedicalBill, 'id'> | MedicalBill) => {
      if ('id' in bill) {
          setMedicalBills(prev => prev.map(b => b.id === bill.id ? bill : b));
      } else {
          setMedicalBills(prev => [...prev, { ...bill, id: Date.now().toString() }]);
      }
  };

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(a => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const renderMainContent = () => {
    if (viewingMember) {
        return <MemberDetailView
            member={viewingMember}
            onBack={() => setViewingMember(null)}
            healthRecords={healthRecords.filter(r => r.memberId === viewingMember.id)}
            prescriptions={prescriptions.filter(p => p.memberId === viewingMember.id)}
            medicalDocuments={medicalDocuments.filter(d => d.memberId === viewingMember.id)}
            sharedAccessList={sharedAccess.filter(s => s.memberId === viewingMember.id)}
            addHealthRecord={addHealthRecord}
            addPrescription={addPrescription}
            updateFamilyMember={updateFamilyMember}
            addMedicalDocument={addMedicalDocument}
            deleteMedicalDocument={deleteMedicalDocument}
            addSharedAccess={addSharedAccess}
            revokeSharedAccess={revokeSharedAccess}
        />
    }

    switch (activeView) {
      case View.Dashboard:
        return <DashboardView 
                  familyMembers={familyMembers} 
                  healthRecords={healthRecords} 
                  upcomingAppointments={upcomingAppointments} 
                  aiInsights={aiInsights}
                />;
      case View.Family:
        return <FamilyView 
                  familyMembers={familyMembers} 
                  addFamilyMember={addFamilyMember}
                  updateFamilyMember={updateFamilyMember}
                  onSelectMember={setViewingMember}
                />;
      case View.Appointments:
        return <AppointmentsView appointments={appointments} familyMembers={familyMembers} addAppointment={addAppointment} />;
      case View.Insurance:
        return <InsuranceView 
                    policies={insurancePolicies} 
                    bills={medicalBills}
                    familyMembers={familyMembers}
                    onSavePolicy={addOrUpdatePolicy}
                    onSaveBill={addOrUpdateBill}
                />;
      default:
        return <DashboardView 
                  familyMembers={familyMembers} 
                  healthRecords={healthRecords} 
                  upcomingAppointments={upcomingAppointments}
                  aiInsights={aiInsights}
                />;
    }
  };

  if (!isAuthenticated || !currentUser) {
    if (publicView === 'landing') {
        return <LandingView onNavigateToLogin={() => setPublicView('login')} />;
    }
    return <LoginView onLogin={handleLogin} onNavigateToLanding={() => setPublicView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header 
        user={currentUser}
        activeView={activeView} 
        setActiveView={(view) => {
            setActiveView(view);
            setViewingMember(null);
        }}
        notifications={notifications}
        onDismissNotification={dismissNotification}
        onRequestNotificationPermission={requestNotificationPermission}
        notificationPermission={notificationPermission}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        isMemberView={!!viewingMember}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;
