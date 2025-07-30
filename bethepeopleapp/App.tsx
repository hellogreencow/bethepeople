import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Image,
  Dimensions,
  Animated
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data matching the web version
const mockEvents = [
  {
    id: '1',
    title: 'Community Garden Cleanup',
    organization: 'Green Earth Initiative',
    category: 'Environment & Nature',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Central Park Community Garden, Main St',
    description: 'Help maintain our community garden by weeding, planting, and general maintenance. No experience necessary - we\'ll teach you everything you need to know!',
    spotsAvailable: 8,
    totalSpots: 15,
    imageUrl: 'https://images.pexels.com/photos/4503821/pexels-photo-4503821.jpeg',
    familyFriendly: true,
    skillsNeeded: ['No experience needed'],
    commitment: '3 hours weekly'
  },
  {
    id: '2',
    title: 'Reading Buddy Program',
    organization: 'Literacy First',
    category: 'Education & Youth',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-16',
    time: '3:30 PM - 5:00 PM',
    location: 'Lincoln Elementary School, 123 Oak Ave',
    description: 'Spend quality time reading with elementary school children to help improve their literacy skills and foster a love of reading.',
    spotsAvailable: 5,
    totalSpots: 12,
    imageUrl: 'https://images.pexels.com/photos/8613080/pexels-photo-8613080.jpeg',
    familyFriendly: false,
    skillsNeeded: ['Good reading skills', 'Patience with children'],
    commitment: '1.5 hours weekly'
  },
  {
    id: '3',
    title: 'Animal Shelter Dog Walking',
    organization: 'Happy Tails Rescue',
    category: 'Animals & Pets',
    type: 'in-person',
    frequency: 'ongoing',
    date: '2025-01-18',
    time: '8:00 AM - 6:00 PM',
    location: 'Happy Tails Animal Shelter, 456 Pet Lane',
    description: 'Give shelter dogs the exercise and socialization they need by taking them on walks around our facility and nearby trails.',
    spotsAvailable: 15,
    totalSpots: 25,
    imageUrl: 'https://images.pexels.com/photos/4681107/pexels-photo-4681107.jpeg',
    familyFriendly: true,
    skillsNeeded: ['Comfort with dogs', 'Physical activity'],
    commitment: 'Flexible - minimum 2 hours per week'
  },
  {
    id: '4',
    title: 'Food Bank Sorting & Packing',
    organization: 'Community Food Network',
    category: 'Food & Hunger',
    type: 'in-person',
    frequency: 'weekly',
    date: '2025-01-19',
    time: '10:00 AM - 2:00 PM',
    location: 'Community Food Bank, 789 Hope Street',
    description: 'Sort donations, pack food boxes, and help organize inventory to ensure families in need receive nutritious meals.',
    spotsAvailable: 12,
    totalSpots: 20,
    imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg',
    familyFriendly: true,
    skillsNeeded: ['Organization skills', 'Physical activity'],
    commitment: '4 hours weekly'
  }
];

interface SwipeableCardProps {
  event: any;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isTop: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ event, onSwipeRight, onSwipeLeft, isTop }) => {
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
        // Swipe detected
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
            onSwipeRight();
          } else {
            onSwipeLeft();
          }
          // Reset values
          translateX.setValue(0);
          translateY.setValue(0);
          rotate.setValue(0);
        });
      } else {
        // Snap back
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

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'one-time': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'weekly': return { bg: '#D1FAE5', text: '#065F46' };
      case 'monthly': return { bg: '#E9D5FF', text: '#6B21A8' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  // Show swipe indicators
  const showSwipeIndicator = () => {
    const translationX = translateX._value;
    if (Math.abs(translationX) < 50) return null;
    
    if (translationX > 0) {
      return (
        <View style={styles.swipeIndicatorRight}>
          <Text style={styles.swipeIndicatorText}>I'M IN!</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.swipeIndicatorLeft}>
          <Text style={styles.swipeIndicatorText}>SKIP</Text>
        </View>
      );
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
            ...(isTop ? {} : { transform: [{ scale: 0.95 }] }),
          },
        ]}
      >
        {showSwipeIndicator()}
        
        {/* Image */}
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

        {/* Content */}
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
            <View style={[styles.frequencyBadge, { backgroundColor: getFrequencyColor(event.frequency).bg }]}>
              <Text style={[styles.frequencyText, { color: getFrequencyColor(event.frequency).text }]}>
                {event.frequency}
              </Text>
            </View>
            <Text style={styles.commitment}>{event.commitment}</Text>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'swipe'>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);

  const handleSwipeRight = () => {
    const event = mockEvents[currentIndex];
    setMatches(prev => [...prev, event.id]);
    Alert.alert('Great!', `You're interested in: ${event.title}`, [
      { text: 'Awesome!', style: 'default' }
    ]);
    nextCard();
  };

  const handleSwipeLeft = () => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < mockEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('All done!', 'You\'ve seen all opportunities. Check back later for more!', [
        { text: 'Start Over', onPress: () => setCurrentIndex(0) }
      ]);
    }
  };

  const handleButtonAction = (action: 'like' | 'skip') => {
    if (action === 'like') {
      handleSwipeRight();
    } else {
      handleSwipeLeft();
    }
  };

  if (currentView === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B0082" />
        
        <View style={styles.header}>
          <Text style={styles.logo}>💜 Be The People</Text>
          <Text style={styles.subtitle}>Find Your Perfect Volunteer Match</Text>
        </View>
        
        <ScrollView style={styles.welcomeContent}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>🚀 Swipe to Make a Difference!</Text>
            <Text style={styles.welcomeDescription}>
              Discover volunteer opportunities that match your passions. Swipe right to say "I'm in!" and left to skip.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setCurrentView('swipe')}
          >
            <Text style={styles.startButtonText}>Start Swiping</Text>
          </TouchableOpacity>
          
          <View style={styles.featuresCard}>
            <Text style={styles.featureTitle}>✨ Features</Text>
            <Text style={styles.feature}>• Swipe through real volunteer opportunities</Text>
            <Text style={styles.feature}>• Location-based matching</Text>
            <Text style={styles.feature}>• Track your volunteer impact</Text>
            <Text style={styles.feature}>• Connect with local organizations</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentEvent = mockEvents[currentIndex];
  const nextEvent = mockEvents[currentIndex + 1];

  if (currentIndex >= mockEvents.length) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B0082" />
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>🎉 All Done!</Text>
          <Text style={styles.completedText}>
            You've seen all opportunities. You matched with {matches.length} organizations!
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => {
              setCurrentIndex(0);
              setMatches([]);
            }}
          >
            <Text style={styles.startButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B0082" />
        
        {/* Header */}
        <View style={styles.swipeHeader}>
          <TouchableOpacity onPress={() => setCurrentView('welcome')}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discover Opportunities</Text>
          <View style={styles.counter}>
            <Text style={styles.counterText}>{currentIndex + 1}/{mockEvents.length}</Text>
          </View>
        </View>
        
        {/* Card Stack */}
        <View style={styles.cardStack}>
          {/* Next card (background) */}
          {nextEvent && (
            <SwipeableCard
              event={nextEvent}
              onSwipeRight={() => {}}
              onSwipeLeft={() => {}}
              isTop={false}
            />
          )}
          
          {/* Current card (top) */}
          {currentEvent && (
            <SwipeableCard
              event={currentEvent}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              isTop={true}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.skipButton]}
            onPress={() => handleButtonAction('skip')}
          >
            <Text style={styles.actionButtonText}>❌</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.undoButton]}
            onPress={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <Text style={styles.actionButtonText}>↶</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleButtonAction('like')}
          >
            <Text style={styles.actionButtonText}>✅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>Swipe right or tap ✅ to say "I'm in!"</Text>
          <Text style={styles.instructionSubtext}>Swipe left or tap ❌ to skip</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4B0082',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  swipeHeader: {
    backgroundColor: '#4B0082',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  welcomeContent: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 18,
    color: '#6b7280',
    lineHeight: 26,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuresCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  feature: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 24,
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  swipeIndicatorRight: {
    position: 'absolute',
    top: 32,
    left: 32,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    transform: [{ rotate: '12deg' }],
    zIndex: 100,
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    top: 32,
    right: 32,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    transform: [{ rotate: '-12deg' }],
    zIndex: 100,
  },
  swipeIndicatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    height: '40%',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commitment: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  skipButton: {
    backgroundColor: '#f3f4f6',
  },
  undoButton: {
    backgroundColor: '#fef3c7',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    fontSize: 24,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
});