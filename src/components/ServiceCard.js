import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

export default function ServiceCard({ service, onPress, style }) {
  const getServiceIcon = (serviceName) => {
    const iconMap = {
      'Towing Service': 'car-outline',
      'Battery Jump Start': 'battery-charging-outline',
      'Tire Change': 'ellipse-outline',
      'Vehicle Lockout': 'key-outline',
      'Fuel Delivery': 'water-outline',
      'Winch Recovery': 'link-outline',
    };
    return iconMap[serviceName] || 'construct-outline';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(service)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getServiceIcon(service.name)}
          size={32}
          color={colors.primary.main}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.serviceName} numberOfLines={2}>
          {service.name}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${service.price}
            </Text>
            <Text style={styles.currency}>TTD</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.responseTime}>
              {service.responseTime} min
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Available</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  serviceName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.primary.main,
  },
  currency: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  responseTime: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    color: colors.text.inverse,
  },
});
