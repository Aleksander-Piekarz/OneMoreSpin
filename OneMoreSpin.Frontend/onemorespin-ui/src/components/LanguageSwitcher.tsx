import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'pl' ? 'en' : 'pl');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      title={language === 'pl' ? 'Switch to English' : 'Przełącz na Polski'}
    >
      <Globe className="w-5 h-5" />
      <span className="font-semibold">{language === 'pl' ? 'PL' : 'EN'}</span>
    </button>
  );
}
