import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Language Context and Provider ---
type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // New translations added for the blood pressure card
    timeToCheck: "It's time to Check Your",
    bloodPressure: "Blood Pressure",
    yesterdaysReading: "Yesterday's Reading: 140 mg/dl",
    remindMeLater: "Remind me later",
    
    // Header
    home: "Home",
    symptoms: "Symptoms",
    aiHelper: "AI Helper",
    profile: "Profile",
    panic: "Panic",
    
    // Home
    greeting: "Good Day!",
    subtitle: "Health is Wealth",
    addNewMedication: "Add New Medication",
    todaysMedications: "Today's Medications",
    noMedicationsYet: "No medications added yet",
    needHelp: "Need Help?",
    callCaretaker: "Call your caretaker for assistance",
    
    // Medication Form
    addNewMedicationTitle: "Add New Medication",
    medicationName: "Medication Name",
    medicationNamePlaceholder: "e.g., Aspirin, Combiflam",
    dosage: "Dosage",
    dosagePlaceholder: "e.g., 500 mg, 1 tablet",
    frequency: "Frequency",
    frequencyPlaceholder: "e.g., Once Daily, Twice Daily",
    reminderTime: "Reminder Time",
    instructions: "Instructions (Optional)",
    instructionsPlaceholder: "e.g., Take with food",
    addMedication: "Add Medication",
    cancel: "Cancel",
    taken: "Taken",
    
    // Symptoms
    dailyWellnessTracker: "Daily Wellness Tracker",
    todaysVitals: "Today's Vitals",
    temperature: "Temperature",
    heartRate: "Heart Rate",
    normal: "Normal",
    warning: "Warning",
    ayurvedicTips: "Ayurvedic Tips",
    turmericMilk: "Turmeric Milk: Daily before bed for immunity",
    pranayama: "Pranayama: 10 minutes morning breathing",
    tulsiTea: "Tulsi Tea: Twice daily for wellness",
    recordTemperature: "Record Temperature",
    logBP: "Log BP",
    
    // Profile
    personalInfo: "Personal Information",
    phone: "Phone",
    address: "Address",
    healthSummary: "Health Summary",
    daysMedCompliant: "Days Med Compliant",
    activeMedications: "Active Medications",
    familyContacts: "Family Contacts",
    primaryCaretaker: "Primary Caretaker",
    familyDoctor: "Family Doctor",
    changePhoto: "Change Photo",
    emergencyInfo: "Emergency Info",
    editProfile: "Edit Profile",
    
    // AI Helper
    aiHealthAssistant: "AI Health Assistant",
    askAnything: "Ask me anything about your health, medications, or wellness tips!",
    typeMessage: "Type your health question...",
    send: "Send",
    thinking: "Thinking...",
    
    // Emergency
    emergencyPanicButton: "Emergency Panic Button",
    emergencyHelp: "Emergency Help",

    // Misc
    patientDetails: "Patient Details",
    close: "Close"
  },
  hi: {
    // New translations added for the blood pressure card
    timeToCheck: "अपनी जाँच का समय हो गया है",
    bloodPressure: "रक्तचाप",
    yesterdaysReading: "कल की रीडिंग: 140 mg/dl",
    remindMeLater: "मुझे बाद में याद दिलाएं",
    
    // Header
    home: "होम",
    symptoms: "लक्षण",
    aiHelper: "AI सहायक",
    profile: "प्रोफ़ाइल",
    panic: "आपातकाल",
    
    // Home
    greeting: "नमस्ते!",
    subtitle: "स्वास्थ्य ही धन है",
    addNewMedication: "नई दवा जोड़ें",
    todaysMedications: "आज की दवाएं",
    noMedicationsYet: "अभी तक कोई दवा नहीं मिली",
    needHelp: "सहायता चाहिए?",
    callCaretaker: "सहायता के लिए अपने देखभालकर्ता को कॉल करें",
    
    // Medication Form
    addNewMedicationTitle: "नई दवा जोड़ें",
    medicationName: "दवा का नाम",
    medicationNamePlaceholder: "जैसे, एस्प्रिन, कॉम्बिफ्लाम",
    dosage: "खुराक",
    dosagePlaceholder: "जैसे, 500 मिग्रा, 1 गोली",
    frequency: "आवृत्ति",
    frequencyPlaceholder: "जैसे, दिन में एक बार, दिन में दो बार",
    reminderTime: "याद दिलाने का समय",
    instructions: "निर्देश (वैकल्पिक)",
    instructionsPlaceholder: "जैसे, खाने के साथ लें",
    addMedication: "दवा जोड़ें",
    cancel: "रद्द करें",
    taken: "लिया गया",
    
    // Symptoms
    dailyWellnessTracker: "दैनिक स्वास्थ्य ट्रैकर",
    todaysVitals: "आज के महत्वपूर्ण संकेत",
    temperature: "तापमान",
    heartRate: "हृदय गति",
    normal: "सामान्य",
    warning: "चेतावनी",
    ayurvedicTips: "आयुर्वेदिक सुझाव",
    turmericMilk: "हल्दी का दूध: प्रतिरक्षा के लिए रोज सोने से पहले",
    pranayama: "प्राणायाम: सुबह 10 मिनट सांस लेना",
    tulsiTea: "तुलसी चाय: स्वास्थ्य के लिए दिन में दो बार",
    recordTemperature: "तापमान रिकॉर्ड करें",
    logBP: "BP लॉग करें",
    
    // Profile
    personalInfo: "व्यक्तिगत जानकारी",
    phone: "फोन",
    address: "पता",
    healthSummary: "स्वास्थ्य सारांश",
    daysMedCompliant: "दवा अनुपालन के दिन",
    activeMedications: "सक्रिय दवाएं",
    familyContacts: "पारिवारिक संपर्क",
    primaryCaretaker: "मुख्य देखभालकर्ता",
    familyDoctor: "पारिवारिक डॉक्टर",
    changePhoto: "फोटो बदलें",
    emergencyInfo: "आपातकालीन जानकारी",
    editProfile: "प्रोफ़ाइल संपादित करें",
    
    // AI Helper
    aiHealthAssistant: "AI स्वास्थ्य सहायक",
    askAnything: "अपने स्वास्थ्य, दवाओं या कल्याण युक्तियों के बारे में मुझसे कुछ भी पूछें!",
    typeMessage: "अपना स्वास्थ्य प्रश्न टाइप करें...",
    send: "भेजें",
    thinking: "सोच रहा हूँ...",
    
    // Emergency
    emergencyPanicButton: "आपातकालीन पैनिक बटन",
    emergencyHelp: "आपातकालीन सहायता",

    // Misc
    patientDetails: "रोगी विवरण",
    close: "बंद करें"
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// If you want a small in-file demo, wrap usage with LanguageProvider like this:
/*
import React from 'react';
export function DemoApp() {
  return (
    <LanguageProvider>
      <YourAppHere />
    </LanguageProvider>
  );
}
*/

export default LanguageProvider
