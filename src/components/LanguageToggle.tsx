import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-toggle" className="text-sm font-medium">
        EN
      </Label>
      <Switch
        id="language-toggle"
        checked={language === 'hi'}
        onCheckedChange={toggleLanguage}
        className="data-[state=checked]:bg-primary"
      />
      <Label htmlFor="language-toggle" className="text-sm font-medium">
        हिं
      </Label>
    </div>
  );
};

export default LanguageToggle;