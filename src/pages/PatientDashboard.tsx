import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Menu, Plus, Clock, AlertTriangle, Heart, Thermometer, Activity, User, Camera, Edit, Phone, MapPin, Pill, Trash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import LanguageToggle from "@/components/LanguageToggle";
import EnhancedAIChat from "@/components/AIChat";
import { calculateTimeUntilDose, getMedicationStatus } from "@/utils/medicationTimer";
import elderlyYoga from "@/assets/elderly-yoga.jpg";
import ayurvedicHerbs from "@/assets/ayurvedic-herbs.jpg";
import familyProfile from "@/assets/family-profile.jpg";
import healthSymbols from "@/assets/health-symbols.jpg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LOCAL_STORAGE_KEYS = {
  SYMPTOMS: "loggedSymptoms_v1",
  MEDICATIONS: "medications_v1"
};

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showMedicationForm, setShowMedicationForm] = useState(false);

  const [symptoms, setSymptoms] = useState([
    { id: 1, name: "Blood Pressure", value: "120/80", status: "normal", icon: Heart, color: "text-emerald-600" },
    { id: 2, name: "Temperature", value: "98.6°F", status: "normal", icon: Thermometer, color: "text-teal-600" },
    { id: 3, name: "Heart Rate", value: "72 BPM", status: "normal", icon: Activity, color: "text-emerald-600" }
  ]);

  const { toast } = useToast();
  const { t } = useLanguage();

  const genericSymptoms = ["Fatigue", "Headache", "Nausea", "Cough", "Dizziness", "Sore Throat", "Shortness of Breath", "Chest Pain", "Back Pain", "Insomnia"];

  // persisted state
  const [loggedSymptoms, setLoggedSymptoms] = useState<any[]>([]);
  const [newSymptom, setNewSymptom] = useState({ name: "", severity: "mild", notes: "" });

  // medication state
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
    instructions: ""
  });

  // undo helpers
  const [lastDeletedSymptom, setLastDeletedSymptom] = useState<any | null>(null);
  const [undoTimerId, setUndoTimerId] = useState<number | null>(null);

  // load from localStorage on mount (prefer existing local entries)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SYMPTOMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLoggedSymptoms(parsed);
      }
    } catch (e) {
      // ignore parse errors and continue
      console.warn("Failed to read loggedSymptoms from localStorage", e);
    }

    try {
      const rawMed = localStorage.getItem(LOCAL_STORAGE_KEYS.MEDICATIONS);
      if (rawMed) {
        const parsedMed = JSON.parse(rawMed);
        if (Array.isArray(parsedMed)) setMedications(parsedMed);
      }
    } catch (e) {
      console.warn("Failed to read medications from localStorage", e);
    }
  }, []);

  // save on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SYMPTOMS, JSON.stringify(loggedSymptoms));
    } catch (e) {
      console.warn("Failed to save loggedSymptoms to localStorage", e);
    }
  }, [loggedSymptoms]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch (e) {
      console.warn("Failed to save medications to localStorage", e);
    }
  }, [medications]);

  // timers update for meds
  useEffect(() => {
    const interval = setInterval(() => {
      setMedications(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // medication handlers
  const handleAddMedication = () => {
    if (!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newMedication = {
      id: Date.now(),
      ...medicationForm
    };

    setMedications(prev => [newMedication, ...prev]);
    setMedicationForm({ name: "", dosage: "", frequency: "", time: "", instructions: "" });
    setShowMedicationForm(false);

    toast({
      title: "Medication Added",
      description: `${medicationForm.name} has been added to your list`
    });
  };

  const removeMedication = (id: number) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const requestCaretakerHelp = () => {
    toast({
      title: t('needHelp'),
      description: t('callCaretaker')
    });
  };

  // symptom handlers
  const addSymptom = () => {
    if (!newSymptom.name || newSymptom.name.trim() === "") {
      toast({
        title: "Choose a symptom",
        description: "Please select or type a symptom to add.",
        variant: "destructive"
      });
      return;
    }

    const entry = {
      id: Date.now(),
      name: newSymptom.name.trim(),
      severity: newSymptom.severity,
      notes: newSymptom.notes?.trim() || "",
      time: new Date().toISOString()
    };

    setLoggedSymptoms(prev => [entry, ...prev]);
    setNewSymptom({ name: "", severity: "mild", notes: "" });

    toast({
      title: "Symptom logged",
      description: `${entry.name} — ${entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}`
    });
  };

  const removeLoggedSymptom = (id: number) => {
    const toRemove = loggedSymptoms.find(s => s.id === id);
    if (!toRemove) return;

    setLoggedSymptoms(prev => prev.filter(s => s.id !== id));
    setLastDeletedSymptom(toRemove);

    if (undoTimerId) {
      window.clearTimeout(undoTimerId);
      setUndoTimerId(null);
    }
    const tid = window.setTimeout(() => {
      setLastDeletedSymptom(null);
      setUndoTimerId(null);
    }, 8000);
    setUndoTimerId(tid);

    toast({
      title: "Entry deleted",
      description: `${toRemove.name} removed — you have 8s to undo.`,
    });
  };

  // export & clear helpers
  const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) {
      toast({ title: "Nothing to export", description: "No entries found", variant: "destructive" });
      return;
    }
    const cols = Object.keys(rows[0]);
    const csv = [
      cols.join(","),
      ...rows.map(row => cols.map(c => `"${((row[c] ?? "") + "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSymptomsCSV = () => {
    const rows = loggedSymptoms.map(s => ({
      time: new Date(s.time).toLocaleString(),
      symptom: s.name,
      severity: s.severity,
      notes: s.notes || ""
    }));
    exportToCSV("symptoms.csv", rows);
  };

  const exportMedicationsCSV = () => {
    const rows = medications.map(m => ({
      addedAt: m.id ? new Date(m.id).toLocaleString() : "",
      name: m.name || "",
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      time: m.time || "",
      instructions: m.instructions || ""
    }));
    exportToCSV("medications.csv", rows);
  };

  const clearLocalData = () => {
    if (!confirm("Clear saved data (localStorage)? This cannot be undone.")) return;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SYMPTOMS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.MEDICATIONS);
    } catch (e) { console.warn(e); }
    setLoggedSymptoms([]);
    setMedications([]);
    toast({ title: "Local data cleared" });
  };

  // renderers
  const renderHomeContent = () => (
    <div className="space-y-6 pb-[80px]">
      {showMedicationForm && (
        <Card className="border-2 border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="text-lg text-teal-700">{t('addNewMedicationTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-medium">{t('medicationName')}</Label>
              <Input
                id="name"
                placeholder={t('medicationNamePlaceholder')}
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                className="elderly-focus text-base p-3 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="dosage" className="text-base font-medium">{t('dosage')}</Label>
              <Input
                id="dosage"
                placeholder={t('dosagePlaceholder')}
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                className="elderly-focus text-base p-3 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="frequency" className="text-base font-medium">{t('frequency')}</Label>
              <Input
                id="frequency"
                placeholder={t('frequencyPlaceholder')}
                value={medicationForm.frequency}
                onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                className="elderly-focus text-base p-3 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-base font-medium">{t('reminderTime')}</Label>
              <Input
                id="time"
                type="time"
                value={medicationForm.time}
                onChange={(e) => setMedicationForm({ ...medicationForm, time: e.target.value })}
                className="elderly-focus text-base p-3 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="instructions" className="text-base font-medium">{t('instructions')}</Label>
              <Textarea
                id="instructions"
                placeholder={t('instructionsPlaceholder')}
                value={medicationForm.instructions}
                onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
                className="elderly-focus text-base p-3 rounded-xl border-2 min-h-[100px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddMedication}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-teal-700"
              >
                {t('addMedication')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMedicationForm(false)}
                className="px-8 py-3 rounded-xl text-base border-2"
              >
                {t('cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-teal-50 to-teal-50 border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-teal-700 flex items-center gap-3">
              <Pill className="h-6 w-6" />
              {t('todaysMedications')}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowMedicationForm(!showMedicationForm)}
                    className="bg-teal-600 text-white hover:bg-teal-700 rounded-full px-4 py-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('addNewMedication')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('addNewMedication')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8 text-teal-700" />
              </div>
              <p className="text-lg text-muted-foreground mb-2">{t('noMedicationsYet')}</p>
              <p className="text-sm text-muted-foreground">Add your first medication to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                          <Pill className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{med.name}</h3>
                      </div>
                      <p className="text-muted-foreground font-medium text-base">{med.dosage}</p>
                      <p className="text-sm text-muted-foreground">{med.frequency}</p>
                      {med.instructions && (
                        <div className="flex items-center mt-3 p-3 bg-orange-100 rounded-lg border-l-4 border-orange-500">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="text-sm text-orange-600 font-medium">{med.instructions}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center text-teal-700 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{med.time || "No time set"}</span>
                      </div>
                      {med.time && (
                        <div className={`text-xs px-3 py-1 rounded-full mb-3 font-medium ${
                          getMedicationStatus(med.time) === 'urgent' ? 'bg-rose-100 text-rose-800' :
                          getMedicationStatus(med.time) === 'soon' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {calculateTimeUntilDose(med.time)}
                        </div>
                      )}
                      <div className="flex gap-2 justify-end items-center">
                        <Button
                          size="sm"
                          className="bg-teal-600 text-white hover:bg-teal-700 rounded-full px-4"
                        >
                          ✓ {t('taken')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeMedication(med.id)} className="text-rose-600">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-br from-rose-200 to-teal-200 p-6 rounded-2xl text-stone-700 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t('greeting')}</h1>
              <p className="text-stone-600 text-lg">{t('subtitle')}</p>
            </div>
            <div className="text-4xl">🙏</div>
          </div>
          <div className="mt-6">
            <p className="text-stone-600 text-sm mb-3">It's time to Check Your</p>
            <p className="text-xl font-semibold">Blood Pressure</p>
            <p className="text-sm text-stone-500 mt-1">Yesterday's Reading: 140 mg/dl</p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="ghost"
                className="text-stone-700 border border-stone-300 px-6 py-2 rounded-full hover:bg-stone-50"
                onClick={() => {
                  toast({
                    title: "Blood Pressure Check",
                    description: "Remember to check your blood pressure now!"
                  });
                }}
              >
                Remind me later
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12"></div>
      </div>

      <Card className="bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200 cursor-pointer hover:shadow-lg transition-all" onClick={requestCaretakerHelp}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl flex items-center justify-center mr-4 shadow-sm">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{t('needHelp')}</p>
                <p className="text-sm text-muted-foreground">{t('callCaretaker')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-amber-500">
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSymptomsContent = () => (
    <div className="space-y-4 pb-[80px]">
      <div className="relative h-32 rounded-lg overflow-hidden">
        <img
          src={elderlyYoga}
          alt="Wellness and Health"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white">
          <h2 className="text-lg font-bold">{t('dailyWellnessTracker')}</h2>
          <p className="text-sm">{t('subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            {t('todaysVitals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {symptoms.map((symptom) => {
              const Icon = symptom.icon;
              return (
                <div key={symptom.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${symptom.color}`} />
                    <div>
                      <h4 className="font-medium">{symptom.name}</h4>
                      <p className="text-2xl font-bold">{symptom.value}</p>
                    </div>
                  </div>
                  <Badge variant={symptom.status === "normal" ? "default" : "destructive"}>
                    {t(symptom.status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-600" />
            Log Symptom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-sm font-medium">Choose common symptom</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {genericSymptoms.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewSymptom({ ...newSymptom, name: s })}
                    className={`text-left p-3 rounded-lg border ${
                      newSymptom.name === s ? "border-teal-600 bg-teal-50" : "border-stone-100 bg-white"
                    }`}
                  >
                    <div className="font-medium">{s}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Or type a custom symptom</Label>
              <Input
                placeholder="e.g. Sharp pain in left knee"
                value={newSymptom.name}
                onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
                className="mt-2 rounded-lg p-3"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Severity</Label>
              <div className="flex gap-2 mt-2">
                {["mild", "moderate", "severe"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNewSymptom({ ...newSymptom, severity: level })}
                    className={`flex-1 p-3 rounded-lg border font-medium ${
                      newSymptom.severity === level
                        ? level === "mild"
                          ? "bg-emerald-50 border-emerald-400"
                          : level === "moderate"
                          ? "bg-amber-50 border-amber-400"
                          : "bg-rose-50 border-rose-400"
                        : "bg-white border-stone-100"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                placeholder="Anything else to note..."
                value={newSymptom.notes}
                onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
                className="mt-2 rounded-lg p-3 min-h-[80px]"
              />
            </div>

            <div className="pt-1">
              <Button className="w-full bg-teal-600 text-white rounded-xl py-3" onClick={addSymptom}>
                <Plus className="h-4 w-4 mr-2 inline" /> Add Symptom
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loggedSymptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Logged Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {loggedSymptoms.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-base">{s.name}</div>
                        <div className="text-xs text-stone-400">{new Date(s.time).toLocaleString()}</div>
                      </div>
                      <div className="ml-3">
                        <Badge
                          className={`px-3 py-1 text-sm ${
                            s.severity === "mild"
                              ? "bg-emerald-100 text-emerald-700"
                              : s.severity === "moderate"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {s.severity.charAt(0).toUpperCase() + s.severity.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    {s.notes && <p className="mt-2 text-sm text-stone-600">{s.notes}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeLoggedSymptom(s.id)}
                      className="p-2 rounded-full hover:bg-stone-50"
                      aria-label="Delete symptom"
                    >
                      <Trash className="h-4 w-4 text-stone-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('ayurvedicTips')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-24 rounded-lg overflow-hidden mb-4">
            <img
              src={ayurvedicHerbs}
              alt="Ayurvedic Herbs"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <p className="text-sm">🌿 <strong>{t('turmericMilk')}</strong></p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <p className="text-sm">🧘 <strong>{t('pranayama')}</strong></p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <p className="text-sm">☕ <strong>{t('tulsiTea')}</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex-col gap-1">
          <Thermometer className="h-5 w-5" />
          <span className="text-sm">Log Temperature</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-1">
          <Heart className="h-5 w-5" />
          <span className="text-sm">{t('logBP')}</span>
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeContent();
      case "symptoms":
        return renderSymptomsContent();
      case "ai-helper":
        return <EnhancedAIChat />;
      case "profile":
        return (
          <div className="space-y-4 pb-[80px]">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-32 rounded-t-lg overflow-hidden">
                  <img
                    src={familyProfile}
                    alt="Family Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 -mt-8 relative">
                  <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mb-4 border-4 border-stone-100">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Raj Kumar Sharma</h2>
                  <p className="text-stone-400">Age: 68 • Patient ID: #12345</p>
                  <Button size="sm" className="mt-3">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('editProfile')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <Phone className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-stone-400">{t('phone')}</p>
                      <p className="font-medium">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-stone-400">{t('address')}</p>
                      <p className="font-medium">123 Gandhi Nagar, Delhi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-20 rounded-lg overflow-hidden mb-4">
                  <img
                    src={healthSymbols}
                    alt="Health Symbols"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-emerald-100 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-700">7</p>
                    <p className="text-sm text-stone-400">Days Med Compliant</p>
                  </div>
                  <div className="text-center p-3 bg-teal-100 rounded-lg">
                    <p className="text-2xl font-bold text-teal-700">5</p>
                    <p className="text-sm text-stone-400">Active Medications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">परिवार संपर्क (Family Contacts)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Sunita Sharma (Daughter)</p>
                      <p className="text-sm text-stone-400">Primary Caretaker</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <span className="text-stone-700 font-medium">A</span>
                    </div>
                    <div>
                      <p className="font-medium">Dr. Amit Patel</p>
                      <p className="text-sm text-stone-400">Family Doctor</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex-col gap-1">
                <Camera className="h-5 w-5" />
                <span className="text-sm">Change Photo</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-1">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Emergency Info</span>
              </Button>
            </div>
          </div>
        );
      case "ai-helper":
        return <EnhancedAIChat />;
      case "panic":
        return (
          <div className="space-y-4">
            <Card className="border-rose-400">
              <CardHeader>
                <CardTitle className="text-xl text-rose-500">Emergency Panic Button</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-rose-400 text-white btn-elderly">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  Emergency Help
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-[80px]">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="elderly-focus"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-stone-700">
          {t(activeTab === "home" ? "home" :
            activeTab === "symptoms" ? "symptoms" :
              activeTab === "ai-helper" ? "aiHelper" :
                activeTab === "profile" ? "profile" : "panic")}
        </h1>
        <LanguageToggle />
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentRole="patient" />

      <div className="p-4">
        {/* Demo controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
            Demo Mode — Local/Server
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={exportSymptomsCSV} className="bg-teal-600 text-white">
              Export Symptoms
            </Button>
            <Button size="sm" onClick={exportMedicationsCSV} variant="outline">
              Export Meds
            </Button>
            <Button size="sm" onClick={clearLocalData} className="bg-rose-600 text-white">
              Clear Saved Data
            </Button>
          </div>
        </div>

        {/* Undo banner */}
        {lastDeletedSymptom && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 w-[90%] max-w-xl p-3 bg-stone-700 text-white rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{lastDeletedSymptom.name} removed</div>
              <div className="text-xs opacity-80">Click Undo to restore — auto clear in 8s</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLoggedSymptoms(prev => [lastDeletedSymptom, ...prev]);
                  setLastDeletedSymptom(null);
                  if (undoTimerId) { window.clearTimeout(undoTimerId); setUndoTimerId(null); }
                  toast({ title: "Restored", description: `${lastDeletedSymptom.name} restored.` });
                }}
                className="px-3 py-2 bg-teal-600 rounded text-sm font-medium"
              >
                Undo
              </button>
              <button
                onClick={() => {
                  setLastDeletedSymptom(null);
                  if (undoTimerId) { window.clearTimeout(undoTimerId); setUndoTimerId(null); }
                }}
                className="px-2 py-1 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PatientDashboard;
