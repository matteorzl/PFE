import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [cards, setCards] = useState([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showReal, setShowReal] = useState<{ [key: number]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  const { id: categoryId } = useLocalSearchParams<{ id: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSeenDraw, setHasSeenDraw] = useState(false);
  const [hasSeenReal, setHasSeenReal] = useState(false);
  const [soundPlayedSec, setSoundPlayedSec] = useState(0);
  const soundTimer = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/categories/${categoryId}/cards`)
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(() => setCards([]));
  }, [categoryId]);

  useEffect(() => {
    // Forcer le mode paysage à l'arrivée
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    // Remettre en portrait quand on quitte la page
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
  }, []);

  useEffect(() => {
    setHasSeenDraw(false);
    setHasSeenReal(false);
    setSoundPlayedSec(0);
    if (soundTimer.current) clearInterval(soundTimer.current);
  }, [card]);

  const handlePlaySound = async (card: any, idx: number) => {
    try {
      // Si le son de cette carte est déjà en cours, on stoppe
      if (playingIndex === idx && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingIndex(null);
        return;
      }

      // Sinon, on joue le son normalement
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      setPlayingIndex(idx);
      const { sound } = await Audio.Sound.createAsync({ uri: card.sound_file });
      soundRef.current = sound;
      await sound.playAsync();
      setSoundPlayedSec(0);
      if (soundTimer.current) clearInterval(soundTimer.current);

      let seconds = 0;
      soundTimer.current = setInterval(() => {
        seconds += 1;
        setSoundPlayedSec(s => s + 1);
        if (seconds >= 5) {
          clearInterval(soundTimer.current!);
        }
      }, 1000);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || (status.isLoaded && status.didJustFinish)) {
          setPlayingIndex(null);
          if (soundTimer.current) clearInterval(soundTimer.current);
        }
      });
    } catch (e) {
      setPlayingIndex(null);
    }
  };
  

  const handleToggleImage = (cardId: number) => {
    setShowReal(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const card = cards[currentIndex];

  useEffect(() => {
    if (!userId || !card || !categoryId) return;
    if (hasSeenDraw && hasSeenReal && soundPlayedSec >= 5) {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/validate/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardId: card.id,
          categoryId
        })
      })
      .then(res => res.json())
      .catch(() => {});
    }
  }, [hasSeenDraw, hasSeenReal, soundPlayedSec, userId, card, categoryId]);

  // Quand il affiche l'animation dessinée
  useEffect(() => {
    if (card && !showReal[card.id]) setHasSeenDraw(true);
  }, [card, showReal]);

  // Quand il affiche l'animation réelle
  useEffect(() => {
    if (card && showReal[card.id]) setHasSeenReal(true);
  }, [card, showReal]);

  return (
    <View style={{ flex: 1,}}>
      {card && (
        <Image
          source={{ uri: showReal[card.id] ? card.real_animation : card.draw_animation }}
          style={styles.backgroundImage}
          blurRadius={30}
        />
      )}
      <View style={{ position: 'absolute', top: 50, left: 16, zIndex: 10 }}>
        <TouchableOpacity 
        onPress={async () => {
          if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                setPlayingIndex(null);
              }
          router.push('/series');
        }
          }>
          <Ionicons name="arrow-back" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
      {card && (
        <View style={[{ width: '100%', height: '100%' }, styles.card]}>
          {/* Image */}
          <TouchableOpacity
            onPress={async () => {
              // Stoppe et décharge le son en cours s'il y en a un
              if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                setPlayingIndex(null);
              }
              // Passe à la carte suivante
              setCurrentIndex((prev) => (prev + 1) % cards.length);
            }}
            disabled={cards.length <= 1}
          >
            <Image
              source={{ uri: showReal[card.id] ? card.real_animation : card.draw_animation }}
              style={styles.cardImage}
            />
          </TouchableOpacity>
          {/* Overlay du nom en haut */}
          <View style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 2,
          }}>
            <Text style={styles.cardTitle}>{card.name}</Text>
          </View>
          {/* Overlay des boutons en bas */}
          <View style={styles.tabBar}>
            {/* Bouton Play */}
            <TouchableOpacity onPress={() => handlePlaySound(card, currentIndex)}>
              <Ionicons name={playingIndex === currentIndex ? "pause" : "play"} size={40} color="#1a3cff"/>
            </TouchableOpacity>
            {/* Bouton Switch Image */}
            <TouchableOpacity onPress={() => handleToggleImage(card.id)}>
              <Ionicons name="swap-horizontal" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
    transform: [{ scale: 1 }], // Zoom
  },
  card: {
    height: "100%",
    borderRadius: 16,
    overflow: 'hidden',
    marginTop:5,
    marginBottom: 10,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '99%',
    height: '85%',
    marginTop: 50,
    borderRadius: 16,
    alignSelf: 'center',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf:'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    borderRadius: 26,
    position: 'absolute',
    bottom: 10,
    margin:10,
    elevation: 10,
    width:'70%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderColor:'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  }
});