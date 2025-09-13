import React, { useState } from 'react';
import { FamilyMember } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { UserIcon, PlusIcon } from './icons/ActionIcons.tsx';
import { MemberFormModal } from './MemberFormModal.tsx';


interface FamilyViewProps {
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  onSelectMember: (member: FamilyMember) => void;
}

const FamilyView: React.FC<FamilyViewProps> = ({ familyMembers, addFamilyMember, updateFamilyMember, onSelectMember }) => {
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const handleCloseMemberModal = () => {
    setMemberModalOpen(false);
    setEditingMember(null);
  };

  const handleSaveMember = (memberData: Omit<FamilyMember, 'id'> | FamilyMember) => {
    if ('id' in memberData) {
      updateFamilyMember(memberData);
    } else {
      addFamilyMember(memberData);
    }
    handleCloseMemberModal();
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Family Members</h2>
        <Button onClick={handleOpenAddModal}><PlusIcon/> Add Member</Button>
      </div>

      {familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {familyMembers.map(member => (
            <Card key={member.id} className="text-center flex flex-col items-center">
                <img src={member.avatarUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md" />
                <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
                <p className="text-slate-500">{member.relation}</p>
                <Button onClick={() => onSelectMember(member)} className="mt-4 w-full">
                <UserIcon /> View Details
                </Button>
            </Card>
            ))}
        </div>
        ) : (
            <Card className="text-center py-12">
                <h3 className="text-xl font-semibold text-slate-700">No Family Members Yet</h3>
                <p className="text-slate-500 mt-2">Click "Add Member" to get started.</p>
                <Button onClick={handleOpenAddModal} className="mt-4"><PlusIcon/> Add Member</Button>
            </Card>
        )}

      <MemberFormModal 
        isOpen={isMemberModalOpen}
        onClose={handleCloseMemberModal}
        onSave={handleSaveMember}
        member={editingMember}
      />

    </div>
  );
};

export default FamilyView;
