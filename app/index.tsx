import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';

// App States
type AppState = 'home' | 'voiceConfig' | 'playback';

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
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
  };

  const handleReset = () => {
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
            {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveformBar, 
                  { height: 20 * h }
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
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' }}
        style={styles.barProfileImage}
      />
      
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
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' }}
        style={styles.barProfileImage}
      />
      
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
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
      
      {/* Reset to Start Button */}
      {appState !== 'home' && (
        <View style={styles.resetContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset to Start</Text>
          </TouchableOpacity>
        </View>
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
  },
  
  // Top bar container for States 2 & 3
  topBarContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  
  // Bottom buttons for State 1
  bottomButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
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
  
  // Reset Button
  resetContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resetButton: {
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
  
  // Status Indicator
  statusIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 25,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
