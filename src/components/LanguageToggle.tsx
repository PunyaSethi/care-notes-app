import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" }
];

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label htmlFor="language-select">{t("selectLanguage")}</label>
      <select
        id="language-select"
        value={language}
        onChange={e => setLanguage(e.target.value as any)}
        style={{ padding: "4px" }}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageToggle;
