import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import IntroductionScreen from './IntroductionScreen';
import RegistrationScreen from './RegistrationScreen';
import ProfileSetupScreen from './ProfileSetupScreen';
import DarumaGardenIntroScreen from './DarumaGardenIntroScreen';
import FirstGoalScreen from './FirstGoalScreen';
import HomeScreenTutorial from './HomeScreenTutorial';
import KeyFeaturesIntro from './KeyFeaturesIntro';
import AccessibilityTutorial from './AccessibilityTutorial';
import CompletionScreen from './CompletionScreen';
import VolunteerIntroScreen from './volunteer/VolunteerIntroScreen';
import VolunteerTrainingScreen from './volunteer/VolunteerTrainingScreen';
import VolunteerProfileScreen from './volunteer/VolunteerProfileScreen';
import VolunteerGuidelinesScreen from './volunteer/VolunteerGuidelinesScreen';
import VolunteerDashboardIntro from './volunteer/VolunteerDashboardIntro';
import { X } from 'lucide-react';

interface Props {
  onComplete: (userType: 'elder' | 'volunteer', userData: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  error: string | null;
  onErrorClear: () => void;
}

export default function OnboardingModal({ onComplete, error, onErrorClear }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'elder' | 'volunteer' | null>(null);
  const [userData, setUserData] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleUserTypeSelect = (type: 'elder' | 'volunteer') => {
    setUserType(type);
    handleNext();
  };

  const handleRegistrationComplete = (data: { email: string; password: string; name: string }) => {
    setUserData(data);
    handleNext();
  };

  const handleFinalComplete = () => {
    if (userType && userData) {
      onComplete(userType, userData);
    }
  };

  const renderContent = () => {
    if (currentStep === 0) {
      return <WelcomeScreen key="welcome" onNext={handleUserTypeSelect} />;
    }

    if (userType === 'elder') {
      switch (currentStep) {
        case 1:
          return <IntroductionScreen key="intro" onNext={handleNext} />;
        case 2:
          return <RegistrationScreen key="register" onNext={handleRegistrationComplete} onBack={handleBack} />;
        case 3:
          return <ProfileSetupScreen key="profile" onNext={handleNext} onSkip={handleNext} />;
        case 4:
          return <DarumaGardenIntroScreen key="garden" onNext={handleNext} />;
        case 5:
          return <FirstGoalScreen key="goal" onNext={handleNext} />;
        case 6:
          return <HomeScreenTutorial key="tutorial" onNext={handleNext} />;
        case 7:
          return <KeyFeaturesIntro key="features" onNext={handleNext} onBack={handleBack} />;
        case 8:
          return <AccessibilityTutorial key="accessibility" onNext={handleNext} />;
        case 9:
          return <CompletionScreen key="completion" onComplete={handleFinalComplete} />;
        default:
          return null;
      }
    }

    switch (currentStep) {
      case 1:
        return <VolunteerIntroScreen key="volunteer-intro" onNext={handleNext} />;
      case 2:
        return <RegistrationScreen key="volunteer-register" onNext={handleRegistrationComplete} onBack={handleBack} />;
      case 3:
        return <VolunteerProfileScreen key="volunteer-profile" onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <VolunteerTrainingScreen key="volunteer-training" onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <VolunteerGuidelinesScreen key="volunteer-guidelines" onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <VolunteerDashboardIntro key="volunteer-dashboard" onComplete={handleFinalComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={() => onComplete('elder', { email: '', password: '', name: '' })}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={onErrorClear}
                className="text-red-700 hover:text-red-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}