import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ServiceCard from '../../components/ServiceCard';
import EmergencyButton from '../../components/EmergencyButton';
import ActiveServiceCard from '../../components/ActiveServiceCard';
import QuickStatsCard from '../../components/QuickStatsCard';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import { useActiveService } from '../../hooks/useActiveService';
import { colors, spacing, typography } from '../../constants/theme';

export default function CustomerDashboard({ navigation }) {
  const { user } = useAuth();
  const { services, loading: servicesLoading, refreshServices } = useServices();
  const { activeService, loading: activeServiceLoading } = useActiveService();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshServices();
    setRefreshing(false);
  };

  const handleServiceSelect = (service) => {
    navigation.navigate('Services', { selectedService: service });
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately alert emergency services and nearby technicians. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: () => {
            // Handle emergency SOS
            Alert.alert('SOS Sent', 'Emergency services have been notified!');
          }
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <QuickStatsCard
        icon="car-outline"
        title="Services Used"
        value="12"
        subtitle="This month"
      />
      <QuickStatsCard
        icon="star-outline"
        title="Rating"
        value="4.8"
        subtitle="Average rating"
      />
      <QuickStatsCard
        icon="time-outline"
        title="Avg Response"
        value="18 min"
        subtitle="Last 5 services"
      />
    </View>
  );

  const renderActiveService = () => {
    if (!activeService) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Service</Text>
        <ActiveServiceCard
          service={activeService}
          onTrack={() => navigation.navigate('Tracking')}
        />
      </View>
    );
  };

  const renderServices = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesScroll}
      >
        {services.slice(0, 4).map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() => handleServiceSelect(service)}
            style={styles.serviceCard}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderEmergencySection = () => (
    <View style={styles.emergencySection}>
      <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
      <Text style={styles.emergencySubtitle}>
        Need immediate help? Press the SOS button to alert emergency services.
      </Text>
      <EmergencyButton onPress={handleEmergencyPress} />
    </View>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderQuickStats()}
        {renderActiveService()}
        {renderServices()}
        {renderEmergencySection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontFamily: typography.fonts.regular,
  },
  userName: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    fontFamily: typography.fonts.bold,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontFamily: typography.fonts.semibold,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
    fontFamily: typography.fonts.medium,
  },
  servicesScroll: {
    gap: spacing.md,
  },
  serviceCard: {
    width: 160,
  },
  emergencySection: {
    padding: spacing.lg,
    margin: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontFamily: typography.fonts.bold,
    marginBottom: spacing.sm,
  },
  emergencySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});
