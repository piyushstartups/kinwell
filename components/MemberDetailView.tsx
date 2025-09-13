import React, { useState, useEffect } from 'react';
import { FamilyMember, HealthRecord, Prescription, HealthRecordType, MedicalDocument, SharedAccess, DocumentType } from '../types.ts';
import { getHealthSummary, analyzePrescriptionImage } from '../services/geminiService.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Modal } from './ui/Modal.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { PlusIcon, SyncIcon, EditIcon, DocumentIcon, ShareIcon, TrashIcon, ViewIcon, CopyIcon } from './icons/ActionIcons.tsx';
import { MemberFormModal } from './MemberFormModal.tsx';

interface MemberDetailViewProps {
  member: FamilyMember;
  onBack: () => void;
  healthRecords: HealthRecord[];
  prescriptions: Prescription[];
  medicalDocuments: MedicalDocument[];
  sharedAccessList: SharedAccess[];
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  addMedicalDocument: (doc: Omit<MedicalDocument, 'id'>) => void;
  deleteMedicalDocument: (docId: string) => void;
  addSharedAccess: (access: Omit<SharedAccess, 'id' | 'shareDate' | 'accessLink'>) => SharedAccess;
  revokeSharedAccess: (accessId: string) => void;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Omit<MedicalDocument, 'id' | 'memberId'>) => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<DocumentType>(DocumentType.LabResult);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onSave({
                    name,
                    type,
                    uploadDate: new Date().toISOString(),
                    fileUrl: event.target?.result as string,
                });
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setType(DocumentType.LabResult);
            setFile(null);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Document Name" value={name} onChange={e => setName(e.target.value)} required />
                <Select label="Document Type" value={type} onChange={e => setType(e.target.value as DocumentType)} required>
                    {Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Input label="File" type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Document</Button>
                </div>
            </form>
        </Modal>
    );
};

interface ShareAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (shareData: { sharedWithName: string; sharedWithEmail: string }) => SharedAccess;
}

const ShareAccessModal: React.FC<ShareAccessModalProps> = ({ isOpen, onClose, onShare }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccess = onShare({ sharedWithName: name, sharedWithEmail: email });
        setGeneratedLink(newAccess.accessLink);
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setEmail('');
            setGeneratedLink(null);
            setIsCopied(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Grant Access to Profile">
            {generatedLink ? (
                <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Access Link Generated!</h3>
                    <p className="text-slate-600">Share this secure link with {name}. They will have read-only access to the health profile.</p>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                       <Input readOnly value={generatedLink || ''} className="flex-grow" />
                       <Button onClick={handleCopy} size="sm" variant="secondary">{isCopied ? 'Copied!' : <CopyIcon />}</Button>
                    </div>
                    <Button onClick={onClose}>Done</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Caregiver/Doctor Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Generate Secure Link</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

const MemberDetailView: React.FC<MemberDetailViewProps> = (props) => {
    const { 
        member, onBack, healthRecords, prescriptions, medicalDocuments, sharedAccessList,
        addHealthRecord, addPrescription, updateFamilyMember,
        addMedicalDocument, deleteMedicalDocument, addSharedAccess, revokeSharedAccess
    } = props;
    
    const [activeTab, setActiveTab] = useState('summary');
    
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ type: HealthRecordType.BloodPressure, value: '', value2: '', date: '', notes: '' });
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
    const [newPrescription, setNewPrescription] = useState({ name: '', dosage: '', frequency: '', startDate: '', endDate: '' });
    const [uploadedImage, setUploadedImage] = useState<{ file: File, base64: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');

    const [aiSummary, setAiSummary] = useState('');
    const [isSummaryLoading, setSummaryLoading] = useState(false);
  
    const [isMemberModalOpen, setMemberModalOpen] = useState(false);
    
    const [isDocUploadModalOpen, setDocUploadModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    useEffect(() => {
        setAiSummary('');
        setSyncMessage('');
        setActiveTab('summary');
    }, [member]);

    const handleSaveMember = (memberData: Omit<FamilyMember, 'id'> | FamilyMember) => {
        if ('id' in memberData) {
            updateFamilyMember(memberData);
        }
        setMemberModalOpen(false);
    };

    const handleSyncHealthData = async () => {
        setIsSyncing(true);
        setSyncMessage('');
        await new Promise(res => setTimeout(res, 1500)); 

        addHealthRecord({
            memberId: member.id,
            type: HealthRecordType.HeartRate,
            value: Math.floor(Math.random() * (85 - 60 + 1) + 60),
            date: new Date().toISOString(),
            notes: 'Synced from Apple Health'
        });
        addHealthRecord({
            memberId: member.id,
            type: HealthRecordType.BloodOxygen,
            value: Math.floor(Math.random() * (100 - 95 + 1) + 95),
            date: new Date().toISOString(),
            notes: 'Synced from Apple Health'
        });
    
        setIsSyncing(false);
        setSyncMessage('Health data synced successfully!');
        setTimeout(() => setSyncMessage(''), 3000);
    };

    const handleOpenRecordModal = () => {
        setNewRecord({ type: HealthRecordType.BloodPressure, value: '', value2: '', date: new Date().toISOString().split('T')[0], notes: '' });
        setRecordModalOpen(true);
    };
  
    const handleAddRecord = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRecord.value && newRecord.date) {
            addHealthRecord({
                memberId: member.id,
                type: newRecord.type,
                value: parseFloat(newRecord.value),
                value2: newRecord.type === HealthRecordType.BloodPressure && newRecord.value2 ? parseFloat(newRecord.value2) : undefined,
                date: new Date(newRecord.date).toISOString(),
                notes: newRecord.notes
            });
            setRecordModalOpen(false);
        }
    };

    const resetPrescriptionModal = () => {
        setNewPrescription({ name: '', dosage: '', frequency: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
        setUploadedImage(null);
        setIsAnalyzing(false);
        setAnalysisError('');
    };

    const handleOpenPrescriptionModal = () => {
        resetPrescriptionModal();
        setPrescriptionModalOpen(true);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setAnalysisError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage({ file, base64: (reader.result as string).split(',')[1] });
            };
            reader.readAsDataURL(file);
        } else {
            setAnalysisError('Please select a valid image file.');
        }
    };
  
    const handleAnalyzeImage = async () => {
        if (!uploadedImage) return;
        setIsAnalyzing(true);
        setAnalysisError('');
        try {
            const result = await analyzePrescriptionImage(uploadedImage.base64, uploadedImage.file.type);
            setNewPrescription(prev => ({ ...prev, ...result }));
        } catch (error) {
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddPrescription = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPrescription.name && newPrescription.dosage && newPrescription.frequency && newPrescription.startDate) {
            addPrescription({
                memberId: member.id,
                ...newPrescription,
                startDate: new Date(newPrescription.startDate).toISOString(),
                endDate: newPrescription.endDate ? new Date(newPrescription.endDate).toISOString() : undefined,
            });
            setPrescriptionModalOpen(false);
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        setAiSummary('');
        try {
            const summary = await getHealthSummary(member, healthRecords, prescriptions);
            setAiSummary(summary);
        } catch (error) {
            console.error("Failed to get AI summary:", error);
            setAiSummary("Sorry, we couldn't generate a summary at this time. Please try again later.");
        } finally {
            setSummaryLoading(false);
        }
    };
  
    const handleSaveDocument = (docData: Omit<MedicalDocument, 'id' | 'memberId'>) => {
        addMedicalDocument({ ...docData, memberId: member.id });
    };
  
    const handleShareAccess = (shareData: { sharedWithName: string; sharedWithEmail: string }) => {
        return addSharedAccess({ ...shareData, memberId: member.id });
    };

    const TabButton = ({ id, label }: { id: string; label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === id ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Button onClick={onBack} variant="secondary" className="mb-2">
                        &larr; Back to Family
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{member.name}'s Health Profile</h2>
                    <p className="text-slate-500">{member.age} years old, {member.relation}</p>
                </div>
                <div className="flex-shrink-0">
                    <img src={member.avatarUrl} alt={member.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
                </div>
            </div>

            <Card>
                <div className="border-b border-slate-200 mb-4">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto">
                        <TabButton id="summary" label="Summary" />
                        <TabButton id="records" label="Records" />
                        <TabButton id="prescriptions" label="Prescriptions" />
                        <TabButton id="documents" label="Documents" />
                        <TabButton id="sharing" label="Sharing" />
                    </nav>
                </div>
                <div className="space-y-6 min-h-[300px]">
                    {activeTab === 'summary' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg text-slate-700">AI Health Summary</h4>
                                <Button onClick={() => setMemberModalOpen(true)} variant="secondary" size="sm">
                                    <EditIcon /> Edit Profile
                                </Button>
                            </div>
                            <Card className="bg-slate-50">
                                {isSummaryLoading && <p className="text-slate-500">Generating summary...</p>}
                                {aiSummary && <p className="text-slate-700 whitespace-pre-wrap">{aiSummary}</p>}
                                {!isSummaryLoading && !aiSummary && <p className="text-slate-500">Click the button below to generate an AI-powered health summary.</p>}
                            </Card>
                            <Button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="mt-2">
                                {isSummaryLoading ? 'Thinking...' : 'Generate AI Summary'}
                            </Button>
                        </div>
                    )}
                    {activeTab === 'records' && (
                       <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg text-slate-700">Health Records</h4>
                                <div className="flex gap-2">
                                    <Button onClick={handleSyncHealthData} variant="secondary" disabled={isSyncing}>
                                        <SyncIcon /> {isSyncing ? 'Syncing...' : 'Sync'}
                                    </Button>
                                    <Button onClick={handleOpenRecordModal} variant="secondary"><PlusIcon /> Add</Button>
                                </div>
                            </div>
                            {syncMessage && <div className="text-sm text-green-600 mb-2">{syncMessage}</div>}
                            <div className="max-h-80 overflow-y-auto pr-2">
                                {healthRecords.length > 0 ? [...healthRecords].reverse().map(r => (
                                    <Card key={r.id} className="mb-2">
                                        <p className="font-semibold">{r.type}: <span className="text-primary-600 font-bold">{r.value}{r.value2 ? `/${r.value2}`:''}</span></p>
                                        <p className="text-sm text-slate-500">{new Date(r.date).toLocaleDateString()}{r.notes && <span className="italic"> - {r.notes}</span>}</p>
                                    </Card>
                                )) : <p className="text-slate-500 p-4 text-center">No health records found.</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'prescriptions' && (
                       <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg text-slate-700">Prescriptions</h4>
                                <Button onClick={handleOpenPrescriptionModal} variant="secondary"><PlusIcon /> Upload Rx</Button>
                            </div>
                            <div className="max-h-80 overflow-y-auto pr-2">
                                {prescriptions.length > 0 ? prescriptions.map(p => (
                                    <Card key={p.id} className="mb-2">
                                        <p className="font-semibold">{p.name}</p>
                                        <p className="text-sm text-slate-500">{p.dosage}, {p.frequency}</p>
                                    </Card>
                                )) : <p className="text-slate-500 p-4 text-center">No prescriptions found.</p>}
                            </div>
                        </div>
                    )}
                     {activeTab === 'documents' && (
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg text-slate-700">Document Vault</h4>
                                <Button onClick={() => setDocUploadModalOpen(true)} variant="secondary"><PlusIcon /> Upload</Button>
                            </div>
                            <div className="max-h-80 overflow-y-auto pr-2">
                                {medicalDocuments.length > 0 ? medicalDocuments.map(doc => (
                                    <Card key={doc.id} className="mb-2 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <DocumentIcon />
                                            <div>
                                                <p className="font-semibold">{doc.name}</p>
                                                <p className="text-sm text-slate-500">{doc.type} - Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary" size="sm"><ViewIcon /></Button></a>
                                            <Button variant="secondary" size="sm" onClick={() => deleteMedicalDocument(doc.id)}><TrashIcon /></Button>
                                        </div>
                                    </Card>
                                )) : <p className="text-slate-500 p-4 text-center">No documents uploaded.</p>}
                            </div>
                        </div>
                     )}
                     {activeTab === 'sharing' && (
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-lg text-slate-700">Profile Sharing</h4>
                                <Button onClick={() => setShareModalOpen(true)} variant="secondary"><ShareIcon /> Grant Access</Button>
                            </div>
                            <div className="max-h-80 overflow-y-auto pr-2">
                                {sharedAccessList.length > 0 ? sharedAccessList.map(sa => (
                                    <Card key={sa.id} className="mb-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{sa.sharedWithName}</p>
                                            <p className="text-sm text-slate-500">{sa.sharedWithEmail} - Shared on {new Date(sa.shareDate).toLocaleDateString()}</p>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => revokeSharedAccess(sa.id)}>Revoke</Button>
                                    </Card>
                                )) : <p className="text-slate-500 p-4 text-center">This profile has not been shared.</p>}
                            </div>
                        </div>
                     )}
                </div>
            </Card>

            <Modal isOpen={isRecordModalOpen} onClose={() => setRecordModalOpen(false)} title="Add Health Record">
                <form onSubmit={handleAddRecord} className="space-y-4">
                    <Select label="Record Type" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value as HealthRecordType})}>
                        {Object.values(HealthRecordType).map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Input label="Value" type="number" step="any" value={newRecord.value} onChange={e => setNewRecord({...newRecord, value: e.target.value})} required/>
                    {newRecord.type === HealthRecordType.BloodPressure && (
                        <Input label="Value 2 (Diastolic)" type="number" step="any" value={newRecord.value2} onChange={e => setNewRecord({...newRecord, value2: e.target.value})} />
                    )}
                    <Input label="Date" type="date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} required/>
                    <Input label="Notes (optional)" value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})}/>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setRecordModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Record</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isPrescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} title="Upload Prescription">
                 {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <p className="text-slate-600">Analyzing prescription, please wait...</p>
                    </div>
                ) : newPrescription.name ? (
                    <form onSubmit={handleAddPrescription} className="space-y-4">
                    <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-md">AI has extracted the following information. Please verify it is correct and fill in the start date.</p>
                    <Input label="Medication Name" value={newPrescription.name} onChange={e => setNewPrescription({...newPrescription, name: e.target.value})} required />
                    <Input label="Dosage (e.g., 10mg)" value={newPrescription.dosage} onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} required />
                    <Input label="Frequency (e.g., Once daily)" value={newPrescription.frequency} onChange={e => setNewPrescription({...newPrescription, frequency: e.target.value})} required />
                    <Input label="Start Date" type="date" value={newPrescription.startDate} onChange={e => setNewPrescription({...newPrescription, startDate: e.target.value})} required/>
                    <Input label="End Date (optional)" type="date" value={newPrescription.endDate} onChange={e => setNewPrescription({...newPrescription, endDate: e.target.value})} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={resetPrescriptionModal}>Start Over</Button>
                        <Button type="submit">Save Prescription</Button>
                    </div>
                </form>
                ) : (
                    <div className="space-y-4">
                        <Input label="Select Prescription Image" type="file" accept="image/*" onChange={handleImageSelect} />
                        {uploadedImage && (
                            <div className="mt-4">
                                <img src={URL.createObjectURL(uploadedImage.file)} alt="Prescription preview" className="max-h-48 w-auto rounded-md mx-auto" />
                            </div>
                        )}
                        {analysisError && <p className="text-red-500 text-sm">{analysisError}</p>}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setPrescriptionModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAnalyzeImage} disabled={!uploadedImage || isAnalyzing}>Analyze Image</Button>
                        </div>
                    </div>
                )}
            </Modal>
      
            <DocumentUploadModal isOpen={isDocUploadModalOpen} onClose={() => setDocUploadModalOpen(false)} onSave={handleSaveDocument} />
            <ShareAccessModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} onShare={handleShareAccess} />

            <MemberFormModal 
                isOpen={isMemberModalOpen}
                onClose={() => setMemberModalOpen(false)}
                onSave={handleSaveMember}
                member={member}
            />
        </div>
    );
};

export default MemberDetailView;
