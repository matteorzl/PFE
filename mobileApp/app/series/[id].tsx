import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [cards, setCards] = useState([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showReal, setShowReal] = useState<{ [key: number]: boolean }>({});
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  const { id: categoryId } = useLocalSearchParams<{ id: string }>();
  console.log('Cards', cards);

  useEffect(() => {
    fetch(`http://localhost:3001/api/categories/${categoryId}/cards`)
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(() => setCards([]));
  }, [categoryId]);

  const handlePlaySound = async (card: any, idx: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
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

  return (
    <View style={{ flex: 1, backgroundColor: '#eee', paddingTop: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
        <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Séries</Text>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Ionicons name="log-out-outline" size={28} color="#1a3cff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {cards.map((card: any, idx) => (
          <TouchableOpacity key={card.id} style={[
            styles.card,
            card.progress === 100 && { borderColor: '#FFD600', borderWidth: 3 }
          ]}>
            <Image
              source={{ uri: showReal[card.id] ? card.real_animation : card.draw_animation }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => handlePlaySound(card, idx)}>
                  <Ionicons name={playingIndex === idx ? "pause-circle" : "play-circle"} size={32} color="#FFD600" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleImage(card.id)}>
                  <Ionicons name="swap-horizontal" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 125/3,
    width: 100/3,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    elevation: 2,
  },
  card: {
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
  progressLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  progressValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'right',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});