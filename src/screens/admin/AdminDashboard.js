import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AnalyticsCard from '../../components/AnalyticsCard';
import ChartCard from '../../components/ChartCard';
import AlertCard from '../../components/AlertCard';
import QuickActionCard from '../../components/QuickActionCard';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics';
import { useSystemAlerts } from '../../hooks/useSystemAlerts';
import { colors, spacing, typography } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const { 
    analytics, 
    loading: analyticsLoading, 
    refreshAnalytics 
  } = useAdminAnalytics();
  const { 
    alerts, 
    emergencyAlerts, 
    loading: alertsLoading 
  } = useSystemAlerts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAnalytics()]);
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.userName}>Welcome, {user?.firstName || 'Admin'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Ionicons name="warning-outline" size={24} color={colors.warning.main} />
            {emergencyAlerts.length > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertCount}>{emergencyAlerts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.metricsGrid}>
        <AnalyticsCard
          title="Total Users"
          value={analytics?.totalUsers?.toLocaleString() || '0'}
          change="+12%"
          changeType="positive"
          icon="people-outline"
        />
        <AnalyticsCard
          title="Active Requests"
          value={analytics?.activeRequests || '0'}
          change="-5%"
          changeType="negative"
          icon="car-outline"
        />
        <AnalyticsCard
          title="Monthly Revenue"
          value={`$${analytics?.monthlyRevenue?.toLocaleString() || '0'}`}
          change="+18%"
          changeType="positive"
          icon="wallet-outline"
        />
        <AnalyticsCard
          title="Response Time"
          value={`${analytics?.averageResponseTime || '0'} min`}
          change="-2 min"
          changeType="positive"
          icon="time-outline"
        />
      </View>
    </View>
  );

  const renderCharts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Analytics Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ChartCard
          title="Revenue Trend"
          type="line"
          data={analytics?.revenueChart}
          width={width - 60}
        />
        <ChartCard
          title="Service Distribution"
          type="pie"
          data={analytics?.serviceDistribution}
          width={width - 60}
        />
        <ChartCard
          title="User Growth"
          type="bar"
          data={analytics?.userGrowth}
          width={width - 60}
        />
      </ScrollView>
    </View>
  );

  const renderSystemAlerts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>System Alerts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.success.main} />
          <Text style={styles.emptyStateText}>All systems operational</Text>
        </View>
      ) : (
        alerts.slice(0, 3).map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onResolve={() => handleResolveAlert(alert.id)}
            onViewDetails={() => navigation.navigate('AlertDetails', { alertId: alert.id })}
          />
        ))
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="User Management"
          subtitle="Manage users and roles"
          icon="people-outline"
          onPress={() => navigation.navigate('Users')}
        />
        <QuickActionCard
          title="System Config"
          subtitle="Configure platform settings"
          icon="settings-outline"
          onPress={() => navigation.navigate('Configuration')}
        />
        <QuickActionCard
          title="Reports"
          subtitle="Generate detailed reports"
          icon="document-text-outline"
          onPress={() => navigation.navigate('Reports')}
        />
        <QuickActionCard
          title="Emergency Ops"
          subtitle="Emergency response center"
          icon="warning-outline"
          onPress={() => navigation.navigate('Emergency')}
        />
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        {analytics?.recentActivity?.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons 
                name={getActivityIcon(activity.type)} 
                size={20} 
                color={colors.primary.main} 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
          </View>
        )) || []}
      </View>
    </View>
  );

  const handleResolveAlert = (alertId) => {
    // Handle alert resolution
    console.log('Resolving alert:', alertId);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return 'person-add-outline';
      case 'service_completed': return 'checkmark-circle-outline';
      case 'payment_processed': return 'card-outline';
      case 'emergency_alert': return 'warning-outline';
      default: return 'information-circle-outline';
    }
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
        {renderKeyMetrics()}
        {renderCharts()}
        {renderSystemAlerts()}
        {renderQuickActions()}
        {renderRecentActivity()}
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
  alertButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  alertBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCount: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bold,
  },
  notificationButton: {
    padding: spacing.sm,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    padding: spacing.md,
    borderRadius: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
  },
  activityTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
