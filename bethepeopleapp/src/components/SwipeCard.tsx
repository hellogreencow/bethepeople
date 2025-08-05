import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  TouchableOpacity
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VolunteerEvent {
  id: string;
  title: string;
  organization: string;
  category: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  frequency: string;
  date: string;
  time: string;
  location: string;
  description: string;
  spotsAvailable: number;
  imageUrl: string;
  familyFriendly: boolean;
  skillsNeeded: string[];
  commitment: string;
}

interface SwipeCardProps {
  event: VolunteerEvent;
  onSwipeRight: (event: VolunteerEvent) => void;
  onSwipeLeft: (event: VolunteerEvent) => void;
  isTop: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  onSwipeRight,
  onSwipeLeft,
  isTop
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const threshold = screenWidth * 0.3;

      if (Math.abs(translationX) > threshold) {
        const direction = translationX > 0 ? 1 : -1;
        
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: direction * screenWidth * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: direction * 30,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (direction > 0) {
            onSwipeRight(event);
          } else {
            onSwipeLeft(event);
          }
          translateX.setValue(0);
          translateY.setValue(0);
          rotate.setValue(0);
        });
      } else {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'virtual': return '#3B82F6';
      case 'hybrid': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={isTop}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { translateY },
              { rotate: rotateInterpolate },
            ],
            zIndex: isTop ? 10 : 1,
            opacity: isTop ? 1 : 0.8,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
          <View style={styles.badgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(event.type) }]}>
              <Text style={styles.badgeText}>{event.type}</Text>
            </View>
            {event.familyFriendly && (
              <View style={[styles.typeBadge, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.badgeText}>Family Friendly</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.organization}>{event.organization}</Text>
          
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>{event.spotsAvailable} spots left</Text>
            </View>
          </View>

          <View style={styles.skillsContainer}>
            {event.skillsNeeded.slice(0, 3).map((skill: string, index: number) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{event.frequency}</Text>
            </View>
            <Text style={styles.commitment}>{event.commitment}</Text>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.75,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  imageContainer: {
    position: 'relative',
    height: '45%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  organization: {
    fontSize: 18,
    color: '#4B0082',
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencyBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  commitment: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SwipeCard;