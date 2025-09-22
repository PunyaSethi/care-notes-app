// PatientDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Import Sidebar and BottomNavigation flexibly
import * as SidebarModule from '@/components/Sidebar';
import * as BottomNavigationModule from '@/components/BottomNavigation';

import EnhancedAIChat from '@/components/AIChat';
import { Heart, Thermometer, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

// Handle different export styles
const SidebarComponent: any =
  (SidebarModule as any)?.default ??
  (SidebarModule as any)?.Sidebar ??
  (SidebarModule as any);

const BottomNavComponent: any =
  (BottomNavigationModule as any)?.default ??
  (BottomNavigationModule as any)?.BottomNavigation ??
  (BottomNavigationModule as any);

type Symptom = { id: number; name: string; severity: string; notes?: string };

const LOCAL_STORAGE_KEYS = {
  SYMPTOMS: 'loggedSymptoms_v1',
  MEDICATIONS: 'medications_v1'
} as const;

export default function PatientDashboard(): JSX.Element {
  const { t } = useLanguage();
  const { toast } = useToast();

  // UI state
  const [activeTab, setActiveTab] = useState<'home' | 'symptoms' | 'medications' | 'chat'>('home');
  const [loggedSymptoms, setLoggedSymptoms] = useState<Symptom[]>([]);
  const [newSymptom, setNewSymptom] = useState({ name: '', severity: 'Mild', notes: '' });

  // Medications
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    instructions: ''
  });

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SYMPTOMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLoggedSymptoms(parsed as Symptom[]);
      }
    } catch {}

    try {
      const rawMed = localStorage.getItem(LOCAL_STORAGE_KEYS.MEDICATIONS);
      if (rawMed) {
        const parsedMed = JSON.parse(rawMed);
        if (Array.isArray(parsedMed)) setMedications(parsedMed);
      }
    } catch {}
  }, []);

  // Persist symptoms
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SYMPTOMS, JSON.stringify(loggedSymptoms));
    } catch {}
  }, [loggedSymptoms]);

  // Persist medications
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch {}
  }, [medications]);

  // Add Symptom
  const addSymptom = () => {
    if (!newSymptom.name.trim()) {
      toast({ title: t('Enter name') });
      return;
    }
    const entry: Symptom = {
      id: Date.now(),
      name: newSymptom.name.trim(),
      severity: newSymptom.severity,
      notes: newSymptom.notes
    };
    setLoggedSymptoms((s) => [entry, ...s]);
    setNewSymptom({ name: '', severity: 'Mild', notes: '' });
    toast({ title: t('Symptom saved') });
  };

  // Delete Symptom
  const deleteSymptom = (id: number) => {
    setLoggedSymptoms((s) => s.filter((x) => x.id !== id));
  };

  // Add Medication
  const addMedication = () => {
    if (!medicationForm.name.trim()) {
      toast({ title: t('Medication name') });
      return;
    }
    setMedications((m) => [{ ...medicationForm, id: Date.now() }, ...m]);
    setMedicationForm({ name: '', dosage: '', frequency: '', time: '', instructions: '' });
    toast({ title: t('Medication saved') });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* Top-right language toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 p-4">
          {SidebarComponent ? <SidebarComponent /> : null}
        </aside>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">{t('Patient Dashboard')}</h1>
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab('home')}>{t('Home')}</Button>
              <Button onClick={() => setActiveTab('symptoms')}>{t('Symptoms')}</Button>
              <Button onClick={() => setActiveTab('chat')}>{t('AI Helper')}</Button>
            </div>
          </div>

          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Home')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('greeting')} — {t('subtitle')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('todaysMedications')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded flex items-center gap-2">
                      <Heart />
                      <div>
                        <div className="text-sm text-slate-500">{t('heartRate')}</div>
                        <div className="font-medium">72 BPM</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded flex items-center gap-2">
                      <Thermometer />
                      <div>
                        <div className="text-sm text-slate-500">{t('temperature')}</div>
                        <div className="font-medium">98.6°F</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded flex items-center gap-2">
                      <Activity />
                      <div>
                        <div className="text-sm text-slate-500">{t('bloodPressure')}</div>
                        <div className="font-medium">120/80</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Symptoms Tab */}
          {activeTab === 'symptoms' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Log Symptom')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>{t('Name')}</Label>
                      <Input
                        value={newSymptom.name}
                        onChange={(e) => setNewSymptom((s) => ({ ...s, name: e.target.value }))}
                        placeholder={t('Enter name')}
                      />

                      <Label className="mt-2">{t('Severity')}</Label>
                      <select
                        value={newSymptom.severity}
                        onChange={(e) => setNewSymptom((s) => ({ ...s, severity: e.target.value }))}
                        className="w-full p-2 border rounded mt-1"
                      >
                        <option>{t('Mild')}</option>
                        <option>{t('Moderate')}</option>
                        <option>{t('Severe')}</option>
                      </select>

                      <Label className="mt-2">{t('Notes')}</Label>
                      <Textarea
                        value={newSymptom.notes}
                        onChange={(e) => setNewSymptom((s) => ({ ...s, notes: e.target.value }))}
                        placeholder={t('Notes')}
                      />

                      <div className="mt-3 flex gap-2">
                        <Button onClick={addSymptom}>{t('Add Symptom')}</Button>
                        <Button
                          variant="ghost"
                          onClick={() => setNewSymptom({ name: '', severity: 'Mild', notes: '' })}
                        >
                          {t('Cancel')}
                        </Button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="mb-2 font-medium">{t('Logged Symptoms')}</h3>
                      {loggedSymptoms.length === 0 ? (
                        <div className="p-4 border rounded">{t('No symptoms logged')}</div>
                      ) : (
                        <ul className="space-y-2">
                          {loggedSymptoms.map((s) => (
                            <li
                              key={s.id}
                              className="p-3 border rounded flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium">{t(s.name) || s.name}</div>
                                <div className="text-sm text-slate-500">{t(s.severity)}</div>
                              </div>
                              <Button
                                variant="destructive"
                                onClick={() => deleteSymptom(s.id)}
                              >
                                {t('Delete')}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('Medications')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('medicationName')}</Label>
                      <Input
                        value={medicationForm.name}
                        onChange={(e) => setMedicationForm((m) => ({ ...m, name: e.target.value }))}
                      />

                      <Label className="mt-2">{t('dosage')}</Label>
                      <Input
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm((m) => ({ ...m, dosage: e.target.value }))}
                      />

                      <Label className="mt-2">{t('frequency')}</Label>
                      <Input
                        value={medicationForm.frequency}
                        onChange={(e) =>
                          setMedicationForm((m) => ({ ...m, frequency: e.target.value }))
                        }
                      />

                      <Label className="mt-2">{t('Time')}</Label>
                      <Input
                        value={medicationForm.time}
                        onChange={(e) => setMedicationForm((m) => ({ ...m, time: e.target.value }))}
                      />

                      <Label className="mt-2">{t('Instructions')}</Label>
                      <Textarea
                        value={medicationForm.instructions}
                        onChange={(e) =>
                          setMedicationForm((m) => ({ ...m, instructions: e.target.value }))
                        }
                      />

                      <div className="mt-3 flex gap-2">
                        <Button onClick={addMedication}>{t('Add to list')}</Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setMedicationForm({
                              name: '',
                              dosage: '',
                              frequency: '',
                              time: '',
                              instructions: ''
                            })
                          }
                        >
                          {t('Cancel')}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">{t('Medications')}</h3>
                      {medications.length === 0 ? (
                        <div className="p-4 border rounded">{t('No medications yet')}</div>
                      ) : (
                        <ul className="space-y-2">
                          {medications.map((m: any) => (
                            <li
                              key={m.id}
                              className="p-3 border rounded flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium">{t(m.name) || m.name}</div>
                                <div className="text-sm text-slate-500">
                                  {m.dosage} • {m.frequency}
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  setMedications((arr) => arr.filter((x) => x.id !== m.id))
                                }
                              >
                                {t('Delete')}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('AI Helper')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedAIChat />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-8">
            {BottomNavComponent ? (
              <BottomNavComponent
                active={activeTab}
                onChange={(tab: any) => setActiveTab(tab)}
                value={activeTab}
                onValueChange={(tab: any) => setActiveTab(tab)}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
