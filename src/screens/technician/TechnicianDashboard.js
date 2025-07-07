import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import JobCard from '../../components/JobCard';
import EarningsCard from '../../components/EarningsCard';
import StatusCard from '../../components/StatusCard';
import PerformanceChart from '../../components/PerformanceChart';
import { useAuth } from '../../hooks/useAuth';
import { useTechnicianJobs } from '../../hooks/useTechnicianJobs';
import { useTechnicianStatus } from '../../hooks/useTechnicianStatus';
import { colors, spacing, typography } from '../../constants/theme';

export default function TechnicianDashboard({ navigation }) {
  const { user } = useAuth();
  const { 
    availableJobs, 
    activeJob, 
    loading: jobsLoading, 
    refreshJobs,
    acceptJob,
    completeJob 
  } = useTechnicianJobs();
  const { 
    isOnline, 
    toggleStatus, 
    earnings, 
    stats 
  } = useTechnicianStatus();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshJobs();
    setRefreshing(false);
  };

  const handleStatusToggle = async () => {
    try {
      await toggleStatus();
      Alert.alert(
        'Status Updated',
        `You are now ${!isOnline ? 'online' : 'offline'} and ${!isOnline ? 'available' : 'unavailable'} for jobs.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleJobAccept = async (jobId) => {
    try {
      await acceptJob(jobId);
      Alert.alert('Job Accepted', 'You have successfully accepted this job.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job. Please try again.');
    }
  };

  const handleJobComplete = async (jobId) => {
    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async () => {
            try {
              await completeJob(jobId);
              Alert.alert('Job Completed', 'Job has been marked as completed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to complete job. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Technician'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatusCard = () => (
    <View style={styles.statusSection}>
      <StatusCard
        isOnline={isOnline}
        onToggle={handleStatusToggle}
        location={user?.currentLocation || 'Location not available'}
      />
    </View>
  );

  const renderEarningsOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Earnings</Text>
      <EarningsCard
        todayEarnings={earnings?.today || 0}
        weeklyEarnings={earnings?.week || 0}
        monthlyEarnings={earnings?.month || 0}
        completedJobs={stats?.completedToday || 0}
      />
    </View>
  );

  const renderActiveJob = () => {
    if (!activeJob) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Job</Text>
        <JobCard
          job={activeJob}
          type="active"
          onNavigate={() => navigation.navigate('Navigation', { job: activeJob })}
          onComplete={() => handleJobComplete(activeJob.id)}
          onContact={() => navigation.navigate('Chat', { customerId: activeJob.customerId })}
        />
      </View>
    );
  };

  const renderAvailableJobs = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {availableJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No jobs available</Text>
          <Text style={styles.emptyStateSubtext}>
            {isOnline ? 'Check back soon for new opportunities' : 'Go online to see available jobs'}
          </Text>
        </View>
      ) : (
        availableJobs.slice(0, 3).map((job) => (
          <JobCard
            key={job.id}
            job={job}
            type="available"
            onAccept={() => handleJobAccept(job.id)}
            onViewDetails={() => navigation.navigate('JobDetails', { jobId: job.id })}
          />
        ))
      )}
    </View>
  );

  const renderPerformanceOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.performanceGrid}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{stats?.rating || '0.0'}</Text>
          <Text style={styles.performanceLabel}>Rating</Text>
        </View>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{stats?.completedJobs || '0'}</Text>
          <Text style={styles.performanceLabel}>Jobs Completed</Text>
        </View>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{stats?.responseTime || '0'} min</Text>
          <Text style={styles.performanceLabel}>Avg Response</Text>
        </View>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{stats?.acceptanceRate || '0'}%</Text>
          <Text style={styles.performanceLabel}>Acceptance Rate</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Earnings')}
        >
          <Ionicons name="wallet-outline" size={24} color={colors.primary.main} />
          <Text style={styles.actionButtonText}>View Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Jobs')}
        >
          <Ionicons name="briefcase-outline" size={24} color={colors.primary.main} />
          <Text style={styles.actionButtonText}>All Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.primary.main} />
          <Text style={styles.actionButtonText}>Get Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderStatusCard()}
        {renderEarningsOverview()}
        {renderActiveJob()}
        {renderAvailableJobs()}
        {renderPerformanceOverview()}
        {renderQuickActions()}
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  statusSection: {
    padding: spacing.lg,
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
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
    fontFamily: typography.fonts.medium,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontFamily: typography.fonts.medium,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  performanceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: typography.sizes.xl,
    color: colors.primary.main,
    fontFamily: typography.fonts.bold,
  },
  performanceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
  },
});
