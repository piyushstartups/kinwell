import React, { useState, useMemo } from 'react';
import { FamilyMember, HealthRecord, Appointment, HealthRecordType, AIInsight } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from './ui/Card.tsx';
import { Select } from './ui/Select.tsx';
import { LightbulbIcon } from './icons/ActionIcons.tsx';

interface DashboardViewProps {
  familyMembers: FamilyMember[];
  healthRecords: HealthRecord[];
  upcomingAppointments: Appointment[];
  aiInsights: AIInsight[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ familyMembers, healthRecords, upcomingAppointments, aiInsights }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(familyMembers[0]?.id || '');

  const selectedMember = useMemo(() => familyMembers.find(m => m.id === selectedMemberId), [familyMembers, selectedMemberId]);

  const memberRecords = useMemo(() => {
    return healthRecords
      .filter(r => r.memberId === selectedMemberId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [healthRecords, selectedMemberId]);

  const chartData = useMemo(() => {
    const bpData = memberRecords
      .filter(r => r.type === HealthRecordType.BloodPressure)
      .map(r => ({ date: new Date(r.date).toLocaleDateString(), Systolic: r.value, Diastolic: r.value2 }));

    const bmiData = memberRecords
      .filter(r => r.type === HealthRecordType.BMI)
      .map(r => ({ date: new Date(r.date).toLocaleDateString(), BMI: r.value }));
    
    const sugarData = memberRecords
        .filter(r => r.type === HealthRecordType.BloodSugar)
        .map(r => ({ date: new Date(r.date).toLocaleDateString(), 'Blood Sugar': r.value }));


    return { bpData, bmiData, sugarData };
  }, [memberRecords]);
  
  const latestBp = memberRecords.filter(r => r.type === HealthRecordType.BloodPressure).pop();
  const nextAppointmentForMember = upcomingAppointments.find(a => a.memberId === selectedMemberId);
  const memberInsights = useMemo(() => aiInsights.filter(i => i.memberId === selectedMemberId), [aiInsights, selectedMemberId]);

  const insightCategoryColors = {
    'Positive Trend': 'bg-green-100 text-green-800',
    'Observation': 'bg-blue-100 text-blue-800',
    'Needs Attention': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Health Dashboard</h2>
        <div className="w-full sm:w-64">
           <Select id="family-member-select" value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
             {familyMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
           </Select>
        </div>
      </div>
      
      {selectedMember ? (
        <>
        {memberInsights.length > 0 && (
            <Card className="bg-primary-50 border border-primary-200">
                <h3 className="font-semibold text-lg text-primary-800 mb-3 flex items-center gap-2"><LightbulbIcon/> AI Insights</h3>
                <div className="space-y-3">
                    {memberInsights.map(insight => (
                        <div key={insight.id} className="p-3 rounded-lg bg-white">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${insightCategoryColors[insight.category]}`}>{insight.category}</span>
                                <p className="text-sm font-semibold text-slate-700">{insight.title}</p>
                            </div>
                            <p className="text-slate-600 mt-1 text-sm">{insight.description}</p>
                        </div>
                    ))}
                </div>
            </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <h3 className="font-semibold text-slate-600">Latest Blood Pressure</h3>
                {latestBp ? (
                    <p className="text-3xl font-bold text-primary-600 mt-2">{latestBp.value}/{latestBp.value2} <span className="text-lg font-medium text-slate-500">mmHg</span></p>
                ) : <p className="text-slate-500 mt-2">No data</p>}
            </Card>
            <Card>
                <h3 className="font-semibold text-slate-600">Next Appointment</h3>
                {nextAppointmentForMember ? (
                    <div className="mt-2">
                        <p className="text-xl font-bold text-primary-600">{nextAppointmentForMember.title}</p>
                        <p className="text-slate-500">{new Date(nextAppointmentForMember.date).toLocaleString()}</p>
                    </div>
                ) : <p className="text-slate-500 mt-2">No upcoming appointments</p>}
            </Card>
            <Card>
                <h3 className="font-semibold text-slate-600">Member Info</h3>
                <div className="mt-2">
                   <p className="text-xl font-bold text-primary-600">{selectedMember.name}</p>
                   <p className="text-slate-500">{selectedMember.age} years old, {selectedMember.gender}</p>
                </div>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-semibold text-slate-700 mb-4">Blood Pressure Trend</h3>
                {chartData.bpData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.bpData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Systolic" stroke="#4f46e5" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Diastolic" stroke="#f97316" />
                    </LineChart>
                </ResponsiveContainer>
                ) : <p className="text-slate-500 h-[300px] flex items-center justify-center">Not enough data to display chart.</p>}
            </Card>
            <Card>
                <h3 className="font-semibold text-slate-700 mb-4">BMI History</h3>
                {chartData.bmiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.bmiData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="BMI" fill="#4f46e5" />
                    </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-slate-500 h-[300px] flex items-center justify-center">Not enough data to display chart.</p>}
            </Card>
             <Card>
                <h3 className="font-semibold text-slate-700 mb-4">Blood Sugar Trend</h3>
                {chartData.sugarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.sugarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Blood Sugar" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
                ) : <p className="text-slate-500 h-[300px] flex items-center justify-center">Not enough data to display chart.</p>}
            </Card>
        </div>
        </>
      ) : (
        <Card>
            <p className="text-center text-slate-600">Please add a family member to view the dashboard.</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardView;
