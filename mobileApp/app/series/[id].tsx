import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

  useEffect(() => {
    fetch(`http://192.168.1.60:3001/api/categories/${categoryId}/cards`)
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
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded || (status.isLoaded && status.didJustFinish)) {
          setPlayingIndex(null);
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

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ position: 'absolute', top: 50, left: 16, zIndex: 10 }}>
        <TouchableOpacity style={{backgroundColor: 'white', padding: 2, borderRadius: 50 }} onPress={async () => {
          if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                setPlayingIndex(null);
              }
          router.push('/series');
        }
          }>
          <Ionicons name="arrow-back-circle" size={40} color="#1a3cff" />
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
            style={{ backgroundColor: 'white', padding: 4, borderRadius: 50 }}
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
          <View style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            zIndex: 2,
            width: '100%',
          }}>
            {/* Bouton Play */}
            <TouchableOpacity onPress={() => handlePlaySound(card, currentIndex)}>
              <Ionicons name={playingIndex === currentIndex ? "pause-circle" : "play-circle"} size={50} color="#FFD600" style={{backgroundColor: 'white', padding: 4, borderRadius: 50}}/>
            </TouchableOpacity>
            {/* Bouton Switch Image */}
            <TouchableOpacity onPress={() => handleToggleImage(card.id)} style={{backgroundColor: 'white', padding: 4, borderRadius: 50}}>
              <Ionicons name="swap-horizontal" size={50} color="#1a3cff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: "100%",
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'black'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
  }
});