import React, { useState } from 'react';
import { InsurancePolicy, MedicalBill, FamilyMember } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Modal } from './ui/Modal.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { PlusIcon, EditIcon } from './icons/ActionIcons.tsx';

interface InsuranceViewProps {
  policies: InsurancePolicy[];
  bills: MedicalBill[];
  familyMembers: FamilyMember[];
  onSavePolicy: (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => void;
  onSaveBill: (bill: Omit<MedicalBill, 'id'> | MedicalBill) => void;
}

const InsuranceView: React.FC<InsuranceViewProps> = ({ policies, bills, familyMembers, onSavePolicy, onSaveBill }) => {
  const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);
  const [isBillModalOpen, setBillModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [editingBill, setEditingBill] = useState<MedicalBill | null>(null);

  const getMemberName = (memberId: string) => familyMembers.find(m => m.id === memberId)?.name || 'Unknown';

  const handleOpenPolicyModal = (policy: InsurancePolicy | null = null) => {
    setEditingPolicy(policy);
    setPolicyModalOpen(true);
  };
  
  const handleOpenBillModal = (bill: MedicalBill | null = null) => {
    setEditingBill(bill);
    setBillModalOpen(true);
  };

  const statusColors = {
    Paid: 'bg-green-100 text-green-800',
    Due: 'bg-yellow-100 text-yellow-800',
    'Pending Insurance': 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Insurance Policies</h2>
          <Button onClick={() => handleOpenPolicyModal()}><PlusIcon /> Add Policy</Button>
        </div>
        {policies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map(policy => (
              <Card key={policy.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-primary-700">{policy.provider}</h3>
                    <p className="text-slate-600">{policy.planName}</p>
                    <p className="text-sm text-slate-500 mt-1">Policy #: {policy.policyNumber}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenPolicyModal(policy)}><EditIcon/></Button>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium text-slate-700">Deductible</span>
                        <span className="font-semibold">${policy.deductibleMet.toFixed(2)} / ${policy.deductible.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(policy.deductibleMet / policy.deductible) * 100}%` }}></div>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><p className="text-center text-slate-500">No insurance policies added yet.</p></Card>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Medical Bills</h2>
          <Button onClick={() => handleOpenBillModal()}><PlusIcon /> Add Bill</Button>
        </div>
        <Card>
            {bills.length > 0 ? (
                 <div className="divide-y divide-slate-200">
                    {bills.sort((a,b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()).map(bill => (
                        <div key={bill.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800">{bill.description}</p>
                                <p className="text-sm text-slate-500">{bill.provider} for {getMemberName(bill.memberId)} on {new Date(bill.serviceDate).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[bill.status]}`}>{bill.status}</span>
                                <span className="text-lg font-bold text-slate-800">${bill.amount.toFixed(2)}</span>
                                <Button variant="secondary" size="sm" onClick={() => handleOpenBillModal(bill)}><EditIcon/></Button>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : <p className="text-center text-slate-500">No medical bills logged yet.</p>}
        </Card>
      </div>
      
      {isPolicyModalOpen && (
          <PolicyFormModal 
            isOpen={isPolicyModalOpen}
            onClose={() => setPolicyModalOpen(false)}
            onSave={(policy) => { onSavePolicy(policy); setPolicyModalOpen(false); }}
            policy={editingPolicy}
            familyMembers={familyMembers}
          />
      )}
      
      {isBillModalOpen && (
          <BillFormModal
            isOpen={isBillModalOpen}
            onClose={() => setBillModalOpen(false)}
            onSave={(bill) => { onSaveBill(bill); setBillModalOpen(false); }}
            bill={editingBill}
            familyMembers={familyMembers}
            policies={policies}
          />
      )}
    </div>
  );
};

interface PolicyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: Omit<InsurancePolicy, 'id'> | InsurancePolicy) => void;
    policy: InsurancePolicy | null;
    familyMembers: FamilyMember[];
}

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({ isOpen, onClose, onSave, policy, familyMembers }) => {
    const [formData, setFormData] = useState({
        provider: policy?.provider || '',
        planName: policy?.planName || '',
        policyNumber: policy?.policyNumber || '',
        groupNumber: policy?.groupNumber || '',
        memberIds: policy?.memberIds || [],
        deductible: policy?.deductible || 0,
        deductibleMet: policy?.deductibleMet || 0,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (policy) {
            onSave({ ...formData, id: policy.id });
        } else {
            onSave(formData);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={policy ? "Edit Insurance Policy" : "Add Insurance Policy"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="provider" label="Provider" value={formData.provider} onChange={handleChange} required />
                <Input name="planName" label="Plan Name" value={formData.planName} onChange={handleChange} required />
                <Input name="policyNumber" label="Policy Number" value={formData.policyNumber} onChange={handleChange} required />
                <Input name="groupNumber" label="Group Number (optional)" value={formData.groupNumber} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                    <Input name="deductible" label="Total Deductible ($)" type="number" step="0.01" value={formData.deductible} onChange={handleChange} required />
                    <Input name="deductibleMet" label="Deductible Met ($)" type="number" step="0.01" value={formData.deductibleMet} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Policy</Button>
                </div>
            </form>
        </Modal>
    );
}

interface BillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bill: Omit<MedicalBill, 'id'> | MedicalBill) => void;
    bill: MedicalBill | null;
    familyMembers: FamilyMember[];
    policies: InsurancePolicy[];
}

const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, bill, familyMembers, policies }) => {
     const [formData, setFormData] = useState({
        memberId: bill?.memberId || familyMembers[0]?.id || '',
        provider: bill?.provider || '',
        serviceDate: bill?.serviceDate.split('T')[0] || new Date().toISOString().split('T')[0],
        description: bill?.description || '',
        amount: bill?.amount || 0,
        status: bill?.status || 'Due' as MedicalBill['status'],
        insurancePolicyId: bill?.insurancePolicyId || policies[0]?.id || '',
     });
     
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            serviceDate: new Date(formData.serviceDate).toISOString()
        };
        if (bill) {
            onSave({ ...dataToSave, id: bill.id });
        } else {
            onSave(dataToSave);
        }
    };
     
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bill ? "Edit Medical Bill" : "Add Medical Bill"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select name="memberId" label="Family Member" value={formData.memberId} onChange={handleChange} required>
                    {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
                <Input name="provider" label="Service Provider" value={formData.provider} onChange={handleChange} required />
                <Input name="description" label="Service Description" value={formData.description} onChange={handleChange} required />
                 <div className="grid grid-cols-2 gap-4">
                    <Input name="serviceDate" label="Service Date" type="date" value={formData.serviceDate} onChange={handleChange} required />
                    <Input name="amount" label="Amount ($)" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                </div>
                <Select name="status" label="Status" value={formData.status} onChange={handleChange} required>
                    <option value="Due">Due</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending Insurance">Pending Insurance</option>
                </Select>
                 <Select name="insurancePolicyId" label="Apply to Insurance" value={formData.insurancePolicyId} onChange={handleChange}>
                    <option value="">None</option>
                    {policies.map(p => <option key={p.id} value={p.id}>{p.provider} - {p.planName}</option>)}
                </Select>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Bill</Button>
                </div>
            </form>
        </Modal>
    );
}

export default InsuranceView;