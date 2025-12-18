import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

// App States
type AppState = 'home' | 'voiceConfig' | 'playback';

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Animation for waveform
  const waveAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Start waveform animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    
    return () => animation.stop();
  }, []);

  useEffect(() => {
    // Request audio permissions
    const requestPermissions = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Failed to get permissions:', error);
      }
    };
    requestPermissions();
  }, []);

  const handleGridPress = () => {
    setAppState('voiceConfig');
  };

  const handleVoicePress = () => {
    setAppState('voiceConfig');
  };

  const handleReadAloud = () => {
    setAppState('playback');
    speakText();
  };

  const speakText = async () => {
    try {
      setIsSpeaking(true);
      await Speech.stop();
      
      const sampleText = "Hello! I'm Alloy, your HD voice assistant. I'm here to help you with any questions or tasks you have. How can I assist you today?";
      
      Speech.speak(sampleText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const handlePlay = () => {
    if (!isSpeaking) {
      speakText();
    }
  };

  const handleStop = () => {
    Speech.stop();
    setIsSpeaking(false);
    setAppState('voiceConfig');
  };

  const handleProfilePress = () => {
    Speech.stop();
    setIsSpeaking(false);
    setAppState('home');
  };

  // Render State 1: Home/Dormant
  const renderHomeState = () => (
    <View style={styles.buttonContainer}>
      {/* Grid Button */}
      <TouchableOpacity style={styles.gridButton} onPress={handleGridPress}>
        <View style={styles.gridDots}>
          {[...Array(9)].map((_, i) => (
            <View key={i} style={styles.gridDot} />
          ))}
        </View>
      </TouchableOpacity>

      {/* Voice Button with Waveform */}
      <TouchableOpacity style={styles.voiceButton} onPress={handleVoicePress}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' }}
          style={styles.voiceButtonImage}
        />
        {/* Animated Waveform Overlay */}
        <Animated.View 
          style={[
            styles.waveformOverlay,
            {
              opacity: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
            },
          ]}
        >
          <View style={styles.waveformBars}>
            {[0.4, 0.7, 1, 0.7, 0.4].map((height, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveformBar, 
                  { height: 20 * height }
                ]} 
              />
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );

  // Render State 2: Voice Configuration
  const renderVoiceConfigState = () => (
    <View style={styles.voiceBar}>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' }}
          style={styles.barProfileImage}
        />
      </TouchableOpacity>
      
      <View style={styles.voiceInfo}>
        <Text style={styles.voiceName}>Alloy</Text>
        <Text style={styles.voiceQuality}>HD Voice</Text>
      </View>
      
      <TouchableOpacity style={styles.readAloudButton} onPress={handleReadAloud}>
        <Text style={styles.speakerIcon}>🔊</Text>
        <Text style={styles.readAloudText}>Read aloud</Text>
      </TouchableOpacity>
    </View>
  );

  // Render State 3: Playback/Active
  const renderPlaybackState = () => (
    <View style={styles.voiceBar}>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' }}
          style={styles.barProfileImage}
        />
      </TouchableOpacity>
      
      <View style={styles.voiceInfo}>
        <Text style={styles.voiceName}>Alloy</Text>
        <Text style={styles.voiceQuality}>HD Voice</Text>
      </View>
      
      <View style={styles.playbackControls}>
        <TouchableOpacity 
          style={[styles.controlButton, isSpeaking && styles.controlButtonDisabled]} 
          onPress={handlePlay}
        >
          <Text style={styles.controlIcon}>▶</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Text style={styles.controlIcon}>■</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleReset = () => {
    Speech.stop();
    setIsSpeaking(false);
    setAppState('home');
  };

  return (
    <View style={styles.container}>
      {/* Phone Frame */}
      <View style={styles.phoneFrame}>
        {/* Screen Content */}
        <View style={styles.screen}>
          {/* Notch */}
          <View style={styles.notch} />
          
          {/* Main Content Area */}
          <View style={styles.content}>
            {/* Voice bar at top for states 2 & 3 */}
            {(appState === 'voiceConfig' || appState === 'playback') && (
              <View style={styles.topBarContainer}>
                {appState === 'voiceConfig' && renderVoiceConfigState()}
                {appState === 'playback' && renderPlaybackState()}
              </View>
            )}
            
            {/* Home buttons at bottom for state 1 */}
            {appState === 'home' && (
              <View style={styles.bottomButtonContainer}>
                {renderHomeState()}
              </View>
            )}
          </View>
          
          {/* Home Indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>
      
      {/* Reset to Start Button - Outside phone frame */}
      {appState !== 'home' && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset to Start</Text>
        </TouchableOpacity>
      )}
      
      {/* Status Indicator */}
      {isSpeaking && (
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Speaking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    width: Math.min(width * 0.85, 380),
    height: Math.min(height * 0.75, 780),
    backgroundColor: '#1C1C1E',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    borderRadius: 40,
    overflow: 'hidden',
  },
  notch: {
    width: 150,
    height: 35,
    backgroundColor: '#1C1C1E',
    alignSelf: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 80,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#1C1C1E',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  
  // State 1: Home State Styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  gridButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E4DC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridDots: {
    width: 36,
    height: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B7355',
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButtonImage: {
    width: '100%',
    height: '100%',
  },
  waveformOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  
  // State 2 & 3: Voice Bar Styles
  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    gap: 12,
    marginHorizontal: 20,
  },
  barProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  voiceQuality: {
    color: '#8E8E93',
    fontSize: 14,
  },
  readAloudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 6,
  },
  speakerIcon: {
    fontSize: 16,
  },
  readAloudText: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Playback Controls
  playbackControls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 18,
    color: '#1C1C1E',
  },
  
  // Status Indicator
  statusIndicator: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // New styles for layout and reset button
  topBarContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
  },
});
