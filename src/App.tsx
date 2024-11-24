import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DarumaGardenPage from './pages/DarumaGardenPage';
import FamilyFriendsPage from './pages/FamilyFriendsPage';
import MissionsPage from './pages/MissionsPage';
import StoryPage from './pages/StoryPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import OnboardingModal from './components/onboarding/OnboardingModal';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerMissionsPage from './pages/VolunteerMissionsPage';
import VolunteerRewardsPage from './pages/VolunteerRewardsPage';
import { useUserStore } from './store/userStore';
import { supabase } from './lib/supabase';

type Page = 'home' | 'garden' | 'family' | 'missions' | 'story' | 'messages' | 'profile' | 'marketplace' | 'notifications' | 'support' | 'volunteer' | 'volunteer-missions' | 'volunteer-rewards';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { user, setUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: session.user.id,
            type: profile.type,
            name: profile.name,
            email: profile.email,
          });
          setShowOnboarding(false);
        }
      }
    };

    checkSession();
  }, [setUser]);

  const handleOnboardingComplete = async (userType: 'elder' | 'volunteer', userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setError(null);

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            type: userType,
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('User registration failed');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            type: userType,
            name: userData.name,
            email: userData.email,
          },
        ])
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Update local state
      setUser({
        id: authData.user.id,
        type: userType,
        name: userData.name,
        email: userData.email,
      });

      setShowOnboarding(false);
      setCurrentPage(userType === 'volunteer' ? 'volunteer' : 'home');

    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      // You might want to show this error to the user through a toast or alert
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (user?.type === 'volunteer') {
      switch (currentPage) {
        case 'volunteer':
          return <VolunteerDashboard onNavigate={handleNavigate} />;
        case 'missions':
          return <VolunteerMissionsPage onNavigate={handleNavigate} />;
        case 'rewards':
          return <VolunteerRewardsPage onNavigate={handleNavigate} />;
        case 'profile':
          return <ProfilePage onNavigate={handleNavigate} />;
        default:
          return <VolunteerDashboard onNavigate={handleNavigate} />;
      }
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'garden':
        return <DarumaGardenPage onNavigate={handleNavigate} />;
      case 'family':
        return <FamilyFriendsPage onNavigate={handleNavigate} />;
      case 'missions':
        return <MissionsPage onNavigate={handleNavigate} />;
      case 'story':
        return <StoryPage onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'marketplace':
        return <MarketplacePage onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'support':
        return <SupportPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {renderPage()}
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          error={error}
          onErrorClear={() => setError(null)}
        />
      )}
    </>
  );
}