import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AuthScreen from '@/components/screens/AuthScreen';
import AdminPanelScreen from '@/components/screens/AdminPanelScreen';
import UsersScreen from '@/components/screens/UsersScreen';
import SellersScreen from '@/components/screens/SellersScreen';
import OrdersScreen from '@/components/screens/OrdersScreen';
import PlantsScreen from '@/components/screens/PlantsScreen';
import AnalyticsScreen from '@/components/screens/AnalyticsScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import PersonalInfoScreen from '@/components/screens/PersonalInfoScreen';
import NotificationsScreen from '@/components/screens/NotificationsScreen';
import GeneralSettingsScreen from '@/components/screens/GeneralSettingsScreen';
import HelpSupportScreen from '@/components/screens/HelpSupportScreen';
import PrivacyPolicyScreen from '@/components/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '@/components/screens/TermsOfServiceScreen';

export default function App() {
  const { currentScreen, isAuthenticated, darkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'users':          return <UsersScreen />;
      case 'sellers':        return <SellersScreen />;
      case 'orders':         return <OrdersScreen />;
      case 'plants':         return <PlantsScreen />;
      case 'analytics':      return <AnalyticsScreen />;
      case 'profile':        return <ProfileScreen />;
      case 'personal-info':  return <PersonalInfoScreen />;
      case 'notifications':  return <NotificationsScreen />;
      case 'general-settings': return <GeneralSettingsScreen />;
      case 'help-support':   return <HelpSupportScreen />;
      case 'privacy-policy': return <PrivacyPolicyScreen />;
      case 'terms-of-service': return <TermsOfServiceScreen />;
      case 'dashboard':
      default:
        return <AdminPanelScreen />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pt-0 pt-14">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="h-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
