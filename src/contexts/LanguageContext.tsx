// LanguageContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Clean translations object.
 * Keys used across the dashboard are included. Keep keys stable so `t(key)` works everywhere.
 * NOTE: avoid trailing commas on the last property of an object to prevent strict parsers complaining.
 */
const translations: Record<Language, Record<string, string>> = {
  en: {
    'Patient Dashboard': 'Patient Dashboard',
    Home: 'Home',
    Symptoms: 'Symptoms',
    'Log Symptom': 'Log Symptom',
    'Add Symptom': 'Add Symptom',
    'Enter name': 'Enter name',
    Mild: 'Mild',
    Moderate: 'Moderate',
    Severe: 'Severe',
    Notes: 'Notes',
    Name: 'Name',
    'Medication name': 'Medication Name',
    medicationName: 'Medication Name',
    medicationNamePlaceholder: 'e.g., Aspirin, Combiflam',
    medName: 'Medication Name',
    Medications: 'Medications',
    'Add to list': 'Add to list',
    Cancel: 'Cancel',
    Delete: 'Delete',
    'Not set': 'Not set',
    'Logged Symptoms': 'Logged Symptoms',
    'No symptoms logged': 'No symptoms logged',
    'Symptom saved': 'Symptom saved',
    'Medication saved': 'Medication saved',
    'Convert to Hindi': 'Convert to Hindi',
    'Convert to English': 'Convert to English',
    'AI Helper': 'AI Helper',
    greeting: 'Good Day!',
    subtitle: 'Health is Wealth',
    todaysMedications: "Today's Medications",
    heartRate: 'Heart Rate',
    temperature: 'Temperature',
    bloodPressure: 'Blood Pressure',
    dosage: 'Dosage',
    dosagePlaceholder: 'e.g., 500 mg, 1 tablet',
    frequency: 'Frequency',
    frequencyPlaceholder: 'e.g., Once Daily, Twice Daily',
    Time: 'Time',
    Instructions: 'Instructions',
    'Enter message': 'Type your health question...',
    'No medications yet': 'No medications yet'
  },
  hi: {
    'Patient Dashboard': 'रोगी डैशबोर्ड',
    Home: 'होम',
    Symptoms: 'लक्षण',
    'Log Symptom': 'लक्षण दर्ज करें',
    'Add Symptom': 'लक्षण जोड़ें',
    'Enter name': 'नाम दर्ज करें',
    Mild: 'हल्का',
    Moderate: 'मध्यम',
    Severe: 'तीव्र',
    Notes: 'टिप्पणियाँ',
    Name: 'नाम',
    'Medication name': 'दवा का नाम',
    medicationName: 'दवा का नाम',
    medicationNamePlaceholder: 'जैसे, एस्प्रिन, कॉम्बिफ्लाम',
    medName: 'दवा का नाम',
    Medications: 'दवाइयाँ',
    'Add to list': 'सूची में जोड़ें',
    Cancel: 'रद्द करें',
    Delete: 'हटाएं',
    'Not set': 'सेट नहीं',
    'Logged Symptoms': 'दर्ज किए गए लक्षण',
    'No symptoms logged': 'कोई लक्षण दर्ज नहीं किए गए',
    'Symptom saved': 'लक्षण सहेजा गया',
    'Medication saved': 'दवा सहेजी गई',
    'Convert to Hindi': 'हिन्दी में बदलें',
    'Convert to English': 'अंग्रेज़ी में बदलें',
    'AI Helper': 'AI सहायक',
    greeting: 'नमस्ते!',
    subtitle: 'स्वास्थ्य ही धन है',
    todaysMedications: 'आज की दवाएं',
    heartRate: 'हृदय गति',
    temperature: 'तापमान',
    bloodPressure: 'रक्तचाप',
    dosage: 'खुराक',
    dosagePlaceholder: 'जैसे, 500 मिग्रा, 1 गोली',
    frequency: 'आवृत्ति',
    frequencyPlaceholder: 'जैसे, दिन में एक बार, दिन में दो बार',
    Time: 'समय',
    Instructions: 'निर्देश',
    'Enter message': 'अपना स्वास्थ्य प्रश्न टाइप करें...',
    'No medications yet': 'अभी तक कोई दवा नहीं'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // restore saved language from localStorage (if any)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_language');
      if (saved === 'en' || saved === 'hi') {
        setLanguage(saved);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  // persist language changes
  useEffect(() => {
    try {
      localStorage.setItem('app_language', language);
    } catch (e) {
      // ignore localStorage errors
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key: string): string => {
    const dict = translations[language] || {};
    return dict[key] ?? key;
  };

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageProvider;
