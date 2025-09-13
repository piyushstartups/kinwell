import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../types.ts';
import { Modal } from './ui/Modal.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { Button } from './ui/Button.tsx';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<FamilyMember, 'id'> | FamilyMember) => void;
  member?: FamilyMember | null;
}

const initialFormData = {
  name: '',
  age: '',
  gender: 'Male' as 'Male' | 'Female' | 'Other',
  relation: '',
  avatarUrl: '',
};

export const MemberFormModal: React.FC<MemberFormModalProps> = ({ isOpen, onClose, onSave, member }) => {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        age: member.age.toString(),
        gender: member.gender,
        relation: member.relation,
        avatarUrl: member.avatarUrl,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [member, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age, 10);
    if (!formData.name || !formData.relation || isNaN(age)) {
        return;
    }
    
    const memberData = {
        ...formData,
        age,
    };

    if (member && 'id' in member) {
        onSave({ ...memberData, id: member.id });
    } else {
        onSave(memberData);
    }
  };
  
  const modalTitle = member ? 'Edit Family Member' : 'Add Family Member';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-4">
            <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} required />
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </Select>
        </div>
        <Input label="Relation (e.g., Father, Son)" name="relation" value={formData.relation} onChange={handleChange} required />
        <Input label="Profile Picture URL" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." />
         <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};