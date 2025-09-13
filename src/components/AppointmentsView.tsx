import React, { useState, useMemo } from 'react';
import { Appointment, FamilyMember } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Modal } from './ui/Modal.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { PlusIcon } from './icons/ActionIcons.tsx';

interface AppointmentsViewProps {
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ appointments, familyMembers, addAppointment }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    memberId: familyMembers[0]?.id || '',
    title: '',
    date: '',
    time: '',
    doctor: '',
    location: '',
    notes: '',
    reminderOffset: 0,
  });

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const sorted = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      upcoming: sorted.filter(a => new Date(a.date) >= now),
      past: sorted.filter(a => new Date(a.date) < now).reverse(),
    };
  }, [appointments]);

  const getMemberName = (memberId: string) => familyMembers.find(m => m.id === memberId)?.name || 'Unknown';

  const handleOpenModal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setNewAppointment({
      memberId: familyMembers[0]?.id || '',
      title: '',
      date: now.toISOString().slice(0,10),
      time: now.toISOString().slice(11,16),
      doctor: '',
      location: '',
      notes: '',
      reminderOffset: 0,
    })
    setModalOpen(true);
  }

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if(newAppointment.memberId && newAppointment.title && newAppointment.date && newAppointment.time) {
        const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`).toISOString();
        const { time, ...rest } = newAppointment;
        addAppointment({ 
          ...rest, 
          date: dateTime,
          reminderOffset: Number(rest.reminderOffset) > 0 ? Number(rest.reminderOffset) : undefined,
        });
        setModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900">Appointments</h2>
             <Button onClick={handleOpenModal}><PlusIcon/> Add Appointment</Button>
        </div>

        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4 border-b pb-2">Upcoming</h3>
                {upcoming.length > 0 ? (
                    <div className="space-y-4">
                        {upcoming.map(app => (
                            <Card key={app.id}>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <div>
                                        <p className="font-bold text-lg text-primary-700">{app.title}</p>
                                        <p className="font-semibold text-slate-600">For: {getMemberName(app.memberId)}</p>
                                        <p className="text-sm text-slate-500">With: {app.doctor} at {app.location}</p>
                                        {app.notes && <p className="text-sm text-slate-500 mt-1">Notes: {app.notes}</p>}
                                    </div>
                                    <div className="mt-2 sm:mt-0 sm:text-right">
                                        <p className="font-semibold text-slate-800">{new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-slate-600 text-lg">{new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : <p className="text-slate-500">No upcoming appointments scheduled.</p>}
            </div>

            <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4 border-b pb-2">Past</h3>
                {past.length > 0 ? (
                    <div className="space-y-4">
                        {past.map(app => (
                             <Card key={app.id} className="opacity-70">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <div>
                                        <p className="font-bold text-lg text-slate-600">{app.title}</p>
                                        <p className="font-semibold text-slate-500">For: {getMemberName(app.memberId)}</p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 sm:text-right">
                                        <p className="font-semibold text-slate-600">{new Date(app.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : <p className="text-slate-500">No past appointments.</p>}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Appointment">
            <form onSubmit={handleAddAppointment} className="space-y-4">
                <Select label="Family Member" value={newAppointment.memberId} onChange={e => setNewAppointment({...newAppointment, memberId: e.target.value})} required>
                    {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
                <Input label="Title" value={newAppointment.title} onChange={e => setNewAppointment({...newAppointment, title: e.target.value})} required/>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} required/>
                    <Input label="Time" type="time" value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} required/>
                </div>
                <Input label="Doctor" value={newAppointment.doctor} onChange={e => setNewAppointment({...newAppointment, doctor: e.target.value})} required/>
                <Input label="Location" value={newAppointment.location} onChange={e => setNewAppointment({...newAppointment, location: e.target.value})} required/>
                <Select 
                    label="Reminder" 
                    value={newAppointment.reminderOffset} 
                    onChange={e => setNewAppointment({...newAppointment, reminderOffset: parseInt(e.target.value, 10)})}
                  >
                      <option value={0}>No reminder</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={120}>2 hours before</option>
                      <option value={1440}>1 day before</option>
                </Select>
                <Input label="Notes (optional)" value={newAppointment.notes} onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})}/>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Appointment</Button>
                </div>
            </form>
        </Modal>

    </div>
  );
};

export default AppointmentsView;