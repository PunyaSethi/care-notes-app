
import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Menu, Plus, Clock, AlertTriangle, Heart, Thermometer, Activity, User, Camera, Edit, Phone, MapPin, Pill, Trash, ChevronDown, ChevronUp, Star, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import LanguageToggle from "@/components/LanguageToggle";
import EnhancedAIChat from "@/components/AIChat";
import { calculateTimeUntilDose, getMedicationStatus } from "@/utils/medicationTimer";
import elderlyYoga from "@/assets/elderly-yoga.jpg";
import familyProfile from "@/assets/family-profile.jpg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LOCAL_STORAGE_KEYS = {
  SYMPTOMS: "loggedSymptoms_v1",
  MEDICATIONS: "medications_v1",
  PROFILE: "profile_v1"
};

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time?: string;
  instructions?: string;
  lastTaken?: string | null;
};

type Symptom = {
  id: number;
  name: string;
  severity: string;
  notes?: string;
  time: string;
};

type EmergencyContact = {
  id: number;
  name: string;
  relation: string;
  phone: string;
  note?: string;
  primary?: boolean;
};

const defaultProfile = {
  id: 1,
  name: "Raj Kumar Sharma",
  dob: "1957-05-12",
  phone: "",
  email: "",
  address: "",
  verified: false,
  avatar: "",
  diagnoses: ["Hypertension"],
  allergies: ["Penicillin"],
  conditions: ["Type II Diabetes"],
  emergencyContacts: [
    { id: 1, name: "Asha Sharma", relation: "Daughter", phone: "+919876543210", note: "Lives nearby", primary: true }
  ],
  notes: []
};

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showMedicationForm, setShowMedicationForm] = useState(false);

  const [loggedSymptoms, setLoggedSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [profile, setProfile] = useState<any>(defaultProfile);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [logSymptomOpen, setLogSymptomOpen] = useState(true);
  const [newSymptom, setNewSymptom] = useState({ name: "", severity: "mild", notes: "" });

  // load persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SYMPTOMS);
      if (raw) setLoggedSymptoms(JSON.parse(raw));
    } catch {}
    try {
      const rawMed = localStorage.getItem(LOCAL_STORAGE_KEYS.MEDICATIONS);
      if (rawMed) setMedications(JSON.parse(rawMed));
    } catch {}
    try {
      const rawProfile = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE);
      if (rawProfile) setProfile(JSON.parse(rawProfile));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.SYMPTOMS, JSON.stringify(loggedSymptoms)); } catch {}
  }, [loggedSymptoms]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications)); } catch {}
  }, [medications]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE, JSON.stringify(profile)); } catch {}
  }, [profile]);

  // helpers
  const isTakenToday = (isoDate?: string | null) => {
    if (!isoDate) return false;
    try {
      return new Date(isoDate).toDateString() === new Date().toDateString();
    } catch { return false; }
  };

  const handleMarkTaken = (id: number) => {
    setMedications(prev =>
      prev.map(m => m.id === id ? { ...m, lastTaken: new Date().toISOString() } : m)
    );
    const med = medications.find(m => m.id === id);
    toast({ title: "Marked as taken", description: `${med?.name ?? "Medication"} marked as taken` });
  };

  // profile helpers
  const computeAge = (dob?: string) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p: any) => ({ ...p, avatar: reader.result as string }));
      toast({ title: "Avatar updated" });
    };
    reader.readAsDataURL(file);
  };

  const updateProfileField = (field: string, value: any) => {
    setProfile((p: any) => ({ ...p, [field]: value }));
  };

  const addEmergencyContact = (contact: EmergencyContact) => {
    setProfile((p: any) => ({ ...p, emergencyContacts: [contact, ...(p.emergencyContacts || [])] }));
  };

  const togglePrimaryContact = (id: number) => {
    setProfile((p: any) => {
      const contacts: EmergencyContact[] = (p.emergencyContacts || []).map((c: EmergencyContact) =>
        ({ ...c, primary: c.id === id })
      );
      return { ...p, emergencyContacts: contacts };
    });
  };

  const removeEmergencyContact = (id: number) => {
    setProfile((p: any) => ({ ...p, emergencyContacts: (p.emergencyContacts || []).filter((c: EmergencyContact) => c.id !== id) }));
  };

  // Recent activity derived
  const recentActivity = () => {
    const medsTaken = medications
      .filter(m => m.lastTaken)
      .map(m => ({ type: "med", time: m.lastTaken!, text: `Took ${m.name}` }));
    const symptoms = loggedSymptoms.map(s => ({ type: "symptom", time: s.time, text: `Logged ${s.name}` }));
    const merged = [...medsTaken, ...symptoms].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return merged.slice(0, 8);
  };

  // Render: Profile card and other content
  const renderProfileContent = () => {
    const age = computeAge(profile.dob);
    const primary = (profile.emergencyContacts || []).find((c: EmergencyContact) => c.primary) || (profile.emergencyContacts || [])[0];

    return (
      <div className="space-y-6 pb-[80px]">
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-teal-700" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute bottom-0 right-0 opacity-0 w-0 h-0" id="avatarUpload" />
                <label htmlFor="avatarUpload" className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow cursor-pointer">
                  <Camera className="h-4 w-4 text-teal-700" />
                </label>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold truncate">{profile.name}</h2>
                  {profile.verified && <Badge>Verified</Badge>}
                  <button
                    className="flex items-center gap-1 text-sm text-teal-600"
                    onClick={() => {
                      const newName = prompt("Edit display name", profile.name || "");
                      if (newName !== null) updateProfileField("name", newName);
                    }}
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                </div>
                <div className="text-sm text-stone-500 mt-1">
                  DOB: <span className="font-medium">{profile.dob ? new Date(profile.dob).toLocaleDateString() : "—"}</span> • Age: <span className="font-medium">{age || "—"}</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => setActiveTab("home")}>Home</Button>
                  <Button size="sm" onClick={() => setActiveTab("symptoms")}>Symptoms</Button>
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-stone-500">Phone</div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{profile.phone || "Not set"}</div>
                <a href={profile.phone ? `tel:${profile.phone}` : "#"} onClick={(e) => { if (!profile.phone) e.preventDefault(); }} className={`px-3 py-1 rounded-full ${profile.phone ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                  <Phone className="h-4 w-4 inline mr-1" /> Call
                </a>
                <a href={profile.phone ? `sms:${profile.phone}` : (profile.email ? `mailto:${profile.email}` : "#")} className={`px-3 py-1 rounded-full ${profile.phone || profile.email ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-400"}`}>
                  <MessageSquare className="h-4 w-4 inline mr-1" /> Message
                </a>
                <button className="px-3 py-1 rounded-full border" onClick={() => {
                  const val = prompt("Phone number", profile.phone || "");
                  if (val !== null) updateProfileField("phone", val);
                }}>Edit</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-stone-500">Email</div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{profile.email || "Not set"}</div>
                <a href={profile.email ? `mailto:${profile.email}` : "#"} onClick={(e) => { if (!profile.email) e.preventDefault(); }} className={`px-3 py-1 rounded-full ${profile.email ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-400"}`}>
                  <MessageSquare className="h-4 w-4 inline mr-1" /> Email
                </a>
                <button className="px-3 py-1 rounded-full border" onClick={() => {
                  const val = prompt("Email", profile.email || "");
                  if (val !== null) updateProfileField("email", val);
                }}>Edit</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-stone-500">Address</div>
              <div className="flex items-center gap-2">
                <div className="font-medium truncate">{profile.address || "Not set"}</div>
                <button className="px-3 py-1 rounded-full border" onClick={() => {
                  const val = prompt("Address", profile.address || "");
                  if (val !== null) updateProfileField("address", val);
                }}>Edit</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              {(profile.emergencyContacts || []).map((c: EmergencyContact) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                  <div>
                    <div className="font-medium">{c.name} {c.primary && <Badge>Primary Caretaker</Badge>}</div>
                    <div className="text-sm text-stone-500">{c.relation} • {c.phone}</div>
                    {c.note && <div className="text-sm text-stone-400 mt-1">{c.note}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${c.phone}`} className="px-3 py-1 rounded-full bg-rose-500 text-white">Call</a>
                    <button onClick={() => togglePrimaryContact(c.id)} className="px-3 py-1 rounded-full border flex items-center gap-1">
                      <Star className={`h-4 w-4 ${c.primary ? "text-amber-500" : "text-stone-400"}`} /> {c.primary ? "Primary" : "Set Primary"}
                    </button>
                    <button onClick={() => removeEmergencyContact(c.id)} className="px-2 py-1 text-rose-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => {
                const name = prompt("Name");
                if (!name) return;
                const relation = prompt("Relation") || "";
                const phone = prompt("Phone") || "";
                const note = prompt("Note (optional)") || "";
                const id = Date.now();
                addEmergencyContact({ id, name, relation, phone, note, primary: false });
              }}>
                Add Contact
              </Button>

              <Button className="bg-rose-600 text-white" onClick={() => {
                const target = primary?.phone;
                if (target) {
                  window.location.href = `tel:${target}`;
                } else {
                  toast({ title: "No contact", description: "No emergency contact available", variant: "destructive" });
                }
              }}>
                Call Emergency
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medical summary */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-stone-500">Diagnoses</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(profile.diagnoses || []).map((d: string, i: number) => <Badge key={i}>{d}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-sm text-stone-500">Allergies</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(profile.allergies || []).map((a: string, i: number) => <Badge key={i} className="bg-rose-100 text-rose-700">{a}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-sm text-stone-500">Ongoing Conditions</div>
                <div className="mt-2">
                  <div className="text-sm">{(profile.conditions || []).join(", ") || "None"}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={() => {
                const diag = prompt("Add diagnosis (comma separated)") || "";
                if (diag) updateProfileField("diagnoses", [...(profile.diagnoses || []), ...diag.split(",").map((s: string) => s.trim()).filter(Boolean)]);
              }}>
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medications summary */}
        <Card>
          <CardHeader>
            <CardTitle>Medications Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-stone-500">Active medications</div>
                <div className="text-xl font-bold">{medications.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-stone-500">Quick View</div>
                <div className="mt-2 space-y-2">
                  {medications.slice(0, 3).map(m => (
                    <div key={m.id} className="p-2 bg-stone-50 rounded-lg">
                      <div className="font-medium">{m.name} • {m.dosage}</div>
                      <div className="text-xs text-stone-400">{m.time ? `Next: ${m.time}` : "No time set"}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button onClick={() => setActiveTab("home")}>Open Medications</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity().map((a, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    {a.type === "med" ? <Pill className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{a.text}</div>
                    <div className="text-xs text-stone-400">{new Date(a.time).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {recentActivity().length === 0 && <div className="text-sm text-stone-500">No recent activity</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // simplified home and symptoms renderers (kept minimal here)
  const renderHomeContent = () => (
    <div className="space-y-6 pb-[80px]">
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold">Welcome</h3>
          <p className="text-sm text-stone-500">This is your dashboard home.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSymptomsContent = () => (
    <div className="space-y-4 pb-[80px]">
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold">Symptoms</h3>
          <p className="text-sm text-stone-500">Log and view symptoms here.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home": return renderHomeContent();
      case "symptoms": return renderSymptomsContent();
      case "profile": return renderProfileContent();
      case "ai-helper": return <EnhancedAIChat />;
      default: return renderHomeContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-[80px]">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></Button>
        <h1 className="text-xl font-bold text-stone-700">Patient Dashboard</h1>
        <LanguageToggle />
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentRole="patient" />

      <div className="p-4">
        {renderContent()}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PatientDashboard;
