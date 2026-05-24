'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthScreen from '@/components/screens/AuthScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import PlantDetailScreen from '@/components/screens/PlantDetailScreen';
import CartScreen from '@/components/screens/CartScreen';
import ShopScreen from '@/components/screens/ShopScreen';
import OrderConfirmationScreen from '@/components/screens/OrderConfirmationScreen';
import SellerDashboardScreen from '@/components/screens/SellerDashboardScreen';
import AdminPanelScreen from '@/components/screens/AdminPanelScreen';
import BrowseScreen from '@/components/screens/BrowseScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import PersonalInfoScreen from '@/components/screens/PersonalInfoScreen';
import NotificationsScreen from '@/components/screens/NotificationsScreen';
import WishlistScreen from '@/components/screens/WishlistScreen';
import GeneralSettingsScreen from '@/components/screens/GeneralSettingsScreen';
import HelpSupportScreen from '@/components/screens/HelpSupportScreen';
import PrivacyPolicyScreen from '@/components/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '@/components/screens/TermsOfServiceScreen';

export default function Home() {
  const { currentScreen, selectedPlantId, isAuthenticated, selectPlant, userRole, darkMode } = useAppStore();

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Ensure selectedPlantId is set when navigating to plant-detail
  useEffect(() => {
    if (!selectedPlantId && currentScreen === 'plant-detail') {
      selectPlant('plant-1');
    }
  }, [selectedPlantId, currentScreen, selectPlant]);

  // If not authenticated, always show auth screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen />;
      case 'cart':
        return <CartScreen />;
      case 'plant-detail':
        return <PlantDetailScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'order-confirmation':
        return <OrderConfirmationScreen />;
      case 'seller-dashboard':
        return <SellerDashboardScreen />;
      case 'admin':
        return <AdminPanelScreen />;
      case 'browse':
        return <BrowseScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'personal-info':
        return <PersonalInfoScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      case 'general-settings':
        return <GeneralSettingsScreen />;
      case 'help-support':
        return <HelpSupportScreen />;
      case 'privacy-policy':
        return <PrivacyPolicyScreen />;
      case 'terms-of-service':
        return <TermsOfServiceScreen />;
      case 'home':
      default:
        return userRole === 'seller' ? <SellerDashboardScreen /> : <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
