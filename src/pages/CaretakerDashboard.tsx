import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Menu,
  Plus,
  UserCheck,
  UserX,
  Search,
  Users,
  AlertTriangle,
  Pill,
  Heart,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Check,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Vitals = {
  heartRate: number;
  bloodPressure: string;
  temperature: string; // e.g. "99.2°F"
};

type Patient = {
  id: number;
  patientName: string;
  phone: string;
  age: number;
  lastActivity: string;
  urgentAttention: boolean;
  symptoms: string[];
  medicationCompliance: number; // 0-100
  vitals: Vitals;
  nextAppointment: string;
  chronicConditions: string[];
  riskLevel: "high" | "medium" | "low" | string;
  accepted?: boolean;
};

type Invitation = {
  id: number;
  patientName: string;
  phone: string;
  timestamp: string;
  age?: number;
};

const CaretakerDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 3,
      patientName: "Rahul Sharma",
      phone: "+91 9876543211",
      age: 72,
      lastActivity: "2 hours ago",
      urgentAttention: true,
      symptoms: ["Chest pain", "Shortness of breath"],
      medicationCompliance: 85,
      vitals: { heartRate: 95, bloodPressure: "140/90", temperature: "99.2°F" },
      nextAppointment: "Tomorrow, 2:00 PM",
      chronicConditions: ["Hypertension", "Diabetes"],
      riskLevel: "high",
    },
    {
      id: 4,
      patientName: "Abhiram Kumar",
      phone: "+91 8765432108",
      age: 68,
      lastActivity: "30 minutes ago",
      urgentAttention: false,
      symptoms: ["Mild fatigue"],
      medicationCompliance: 95,
      vitals: { heartRate: 72, bloodPressure: "120/80", temperature: "98.6°F" },
      nextAppointment: "Friday, 10:00 AM",
      chronicConditions: ["Arthritis"],
      riskLevel: "low",
    },
    {
      id: 5,
      patientName: "Riya Goel",
      phone: "+91 7654321098",
      age: 78,
      lastActivity: "1 day ago",
      urgentAttention: false,
      symptoms: [],
      medicationCompliance: 60,
      vitals: { heartRate: 78, bloodPressure: "130/85", temperature: "98.4°F" },
      nextAppointment: "Next Monday, 11:00 AM",
      chronicConditions: ["Osteoporosis", "High Cholesterol"],
      riskLevel: "medium",
    },
  ]);

  const [invitations, setInvitations] = useState<Invitation[]>([
    { id: 1, patientName: "Manya Awasthi", phone: "+91 9876543210", timestamp: "2 hours ago", age: 65 },
    { id: 2, patientName: "Yash Verma", phone: "+91 8765432109", timestamp: "1 day ago", age: 71 },
  ]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-yellow-50 text-yellow-800 border-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "text-amber-800";
    if (compliance >= 70) return "text-amber-700";
    return "text-rose-700";
  };

  const handleAcceptInvitation = (id: number) => {
    const invitation = invitations.find((inv) => inv.id === id);
    if (!invitation) return;

    const newPatient: Patient = {
      id: Math.max(...patients.map((p) => p.id), 0) + 1,
      patientName: invitation.patientName,
      phone: invitation.phone,
      age: invitation.age ?? 0,
      accepted: true,
      lastActivity: "Just joined",
      urgentAttention: false,
      symptoms: [],
      medicationCompliance: 100,
      vitals: { heartRate: 75, bloodPressure: "120/80", temperature: "98.6°F" },
      nextAppointment: "To be scheduled",
      chronicConditions: [],
      riskLevel: "low",
    };

    setPatients((prev) => [...prev, newPatient]);
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    toast({
      title: "Invitation Accepted",
      description: `${invitation.patientName} has been added to your patients list.`,
    });
  };

  const handleRejectInvitation = (id: number) => {
    const invitation = invitations.find((inv) => inv.id === id);
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    if (invitation) {
      toast({
        title: "Invitation Rejected",
        description: `You have rejected the invitation from ${invitation.patientName}.`,
        variant: "destructive",
      });
    }
  };

  const handleAddPatientClick = () => {
    toast({
      title: "Add Patient",
      description: "Search for a patient by their phone number to send an invitation.",
    });
  };

  const urgentPatientsCount = patients.filter((p) => p.urgentAttention).length;
  const lowComplianceCount = patients.filter((p) => p.medicationCompliance < 70).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 text-stone-900">
      {/* Header */}
      <header className="bg-white/90 shadow-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="elderly-focus text-stone-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Caretaker Dashboard</h1>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-full px-3 py-1">
            <Search className="h-4 w-4 text-stone-500 mr-2" />
            <Input placeholder="Search patients..." className="bg-transparent border-0 p-0 focus:ring-0" />
          </div>
        </div>
        <div className="hidden md:flex items-center"><LanguageToggle /></div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentRole="caretaker" />

      
      {selectedPatient && (
        <div className="fixed right-4 top-20 w-[95%] max-w-sm md:max-w-md z-50">
          <Card className="shadow-lg">
            <CardHeader className="bg-teal-50">
              <CardTitle className="flex items-center justify-between">
                <span>{t ? t('patientDetails') : 'Patient Details'}</span>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPatient(null)}>Close</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Name: {patients.find(p => p.id === selectedPatient)?.patientName}</p>
              <p>Phone: {patients.find(p => p.id === selectedPatient)?.phone}</p>
              <p>Age: {patients.find(p => p.id === selectedPatient)?.age}</p>
              <p className="mt-2 text-sm text-stone-600">Demo notes: This is a demo detail view for the selected patient.</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 md:p-6 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-amber-200 to-amber-300 text-stone-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Total Patients</p>
                  <p className="text-2xl font-bold">{patients.length}</p>
                </div>
                <Users className="h-7 w-7 text-stone-800/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-200 to-rose-300 text-stone-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Urgent Attention</p>
                  <p className="text-2xl font-bold">{urgentPatientsCount}</p>
                </div>
                <AlertTriangle className="h-7 w-7 text-stone-800/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-100 to-amber-200 text-stone-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Low Compliance</p>
                  <p className="text-2xl font-bold">{lowComplianceCount}</p>
                </div>
                <Pill className="h-7 w-7 text-stone-800/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invitations */}
        {invitations.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Patient Invitations
                <Badge variant="secondary" className="ml-2">
                  {invitations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <TooltipProvider>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="border-l-4 border-amber-200 bg-amber-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-900">{invitation.patientName}</h3>
                        <div className="flex items-center gap-3 text-sm text-stone-600 mt-1">
                          <span>{invitation.phone}</span>
                          <span>•</span>
                          <span>Age: {invitation.age ?? "—"}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Invited {invitation.timestamp}</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        {/* Accept (icon-only on small screens) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              aria-label={`Accept ${invitation.patientName}`}
                              className="flex items-center bg-amber-100 text-amber-800 hover:bg-amber-200"
                              onClick={() => handleAcceptInvitation(invitation.id)}
                            >
                              <UserCheck className="h-4 w-4" />
                              <span className="hidden md:inline ml-2">Accept</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Accept invitation</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Reject (icon-only on small screens) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              aria-label={`Reject ${invitation.patientName}`}
                              className="flex items-center bg-rose-100 text-rose-800 hover:bg-rose-200"
                              onClick={() => handleRejectInvitation(invitation.id)}
                            >
                              <UserX className="h-4 w-4" />
                              <span className="hidden md:inline ml-2">Reject</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reject invitation</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </CardContent>
          </Card>
        )}

        {/* My Patients */}
        <Card className="shadow-sm">
          <CardHeader className="bg-amber-50 flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              My Patients
              <Badge variant="secondary" className="ml-2">
                {patients.length}
              </Badge>
            </CardTitle>

            <Button
              onClick={handleAddPatientClick}
              className="bg-amber-200 text-stone-900 hover:bg-amber-300"
              size="sm"
              aria-label="Add patient"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Add Patient</span>
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {patients.length === 0 ? (
              <div className="text-center py-12 border border-stone-200 rounded-lg bg-stone-50">
                <div className="w-24 h-24 bg-stone-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-stone-400" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">No Patients Yet</h2>
                <p className="text-stone-600 max-w-sm mx-auto mt-2">
                  Accept invitations or add new patients to begin monitoring their health.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input placeholder="Search patients..." className="pl-10 border-stone-200 focus:border-amber-300 focus:ring-amber-300" />
                </div>

                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                      patient.urgentAttention ? "border-rose-200 bg-rose-50" : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 onClick={() => setSelectedPatient(patient.id)} className="font-semibold text-lg text-stone-900 cursor-pointer underline">{patient.patientName}</h3>

                          <Badge className={`${getRiskLevelColor(patient.riskLevel)} border`}>
                            {String(patient.riskLevel).toUpperCase()} RISK
                          </Badge>

                          {patient.urgentAttention && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-200 animate-pulse ml-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              URGENT
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-stone-600 mb-3">
                          <span>{patient.phone}</span>
                          <span>•</span>
                          <span>Age: {patient.age}</span>
                          <span>•</span>
                          <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              {patient.urgentAttention ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </>
                              ) : (
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              )}
                            </span>
                            <span>Last seen: {patient.lastActivity}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Symptoms */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-stone-700 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Current Symptoms
                        </h4>
                        {patient.symptoms.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patient.symptoms.map((symptom, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={`${patient.urgentAttention ? "border-rose-300 text-rose-700" : "border-stone-300 text-stone-700"} text-xs`}
                              >
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-amber-800 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            No symptoms reported
                          </p>
                        )}
                      </div>

                      {/* Medication compliance */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-stone-700 flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Medication Compliance
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-stone-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${patient.medicationCompliance >= 90 ? "bg-amber-600" : patient.medicationCompliance >= 70 ? "bg-amber-400" : "bg-rose-500"}`}
                              style={{ width: `${patient.medicationCompliance}%` }}
                            />
                          </div>
                          <span className={`font-semibold text-sm ${getComplianceColor(patient.medicationCompliance)}`}>
                            {patient.medicationCompliance}%
                          </span>
                        </div>
                        {patient.medicationCompliance < 70 && (
                          <p className="text-xs text-rose-700 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Requires attention
                          </p>
                        )}
                      </div>

                      {/* Vitals */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-stone-700 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Latest Vitals
                        </h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-stone-600">Heart Rate:</span>
                            <span className={`font-medium ${patient.vitals.heartRate > 90 ? "text-rose-700" : "text-stone-900"}`}>
                              {patient.vitals.heartRate} bpm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">Blood Pressure:</span>
                            <span className="font-medium text-stone-900">{patient.vitals.bloodPressure}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">Temperature:</span>
                            <span className={`font-medium ${parseFloat(String(patient.vitals.temperature)) > 99 ? "text-rose-700" : "text-stone-900"}`}>
                              {patient.vitals.temperature}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chronic conditions & appointment */}
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-stone-700 text-sm mb-2">Chronic Conditions</h4>
                        {patient.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patient.chronicConditions.map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-stone-500">None reported</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-stone-700 text-sm mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Next Appointment
                        </h4>
                        <p className="text-sm text-stone-600 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {patient.nextAppointment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CaretakerDashboard;
