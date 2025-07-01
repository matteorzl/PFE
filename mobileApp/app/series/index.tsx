import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Category = {
  id: string;
  name: string;
  image: string;
  progress: number;
};

export default function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();
   const [panelOpen, setPanelOpen] = useState(false);

  const collapsedHeight = 0;
  const expandedHeight = Dimensions.get('window').height * 0.55;
  const panelHeight = useSharedValue(collapsedHeight);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    height: withTiming(panelHeight.value, { duration: 300 }),
  }));

  const openPanel = () => {
    setPanelOpen(true);
    panelHeight.value = expandedHeight;
  };

  const closePanel = () => {
    panelHeight.value = collapsedHeight;
    setTimeout(() => setPanelOpen(false), 300);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(()=> {
    if (!userId) return;
  fetch(`http://172.20.10.2:3001/api/user/${userId}/premium`)
    .then(res => res.json())
    .then(data => {
      // data.premium sera true ou false selon la réponse du backend
      setIsPremium(data.premium);
    })
    .catch(() => {
      setIsPremium(false); // ou gère l'erreur comme tu veux
    });
}, [userId]);

  useEffect(() => {
    // Remplace l'URL par celle de ton API
    fetch('http://172.20.10.2:3001/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#eee', paddingTop: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
        <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Séries</Text>
        <TouchableOpacity onPress={() => userId && router.replace(`/users/${userId}` as any)}>
          <Ionicons name="person-circle-outline" size={40} color="#1a3cff" />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 24, marginBottom: 10 }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons name="search" size={22} color="#1a3cff" style={{ position: 'absolute', right: 16 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {filteredCategories.map((cat: any, idx) => (
          <TouchableOpacity key={cat.id} style={[
            styles.card,
            cat.progress === 100 && { borderColor: '#FFD600', borderWidth: 3 }
          ]}
          onPress={() => router.push(`/series/${cat.id}` as any)}
          >
            <Image
              source={{ uri: cat.image }}
              style={styles.cardImage}
              resizeMode="cover"
              blurRadius={cat.progress === 0 ? 2 : 0}
            />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{cat.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progressLabel}>Progression</Text>
                <Text style={styles.progressValue}>{cat.progress}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!isPremium && (
        <>
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.85}
            onPress={openPanel}
          >
            <Text style={styles.premiumBannerText}>
              Passe 👑 
              <Text style={styles.premiumWord}>Premium </Text>
              👑 pour débloquer toutes les fonctionnalités !
            </Text>
          </TouchableOpacity>
          {panelOpen && (
            <Pressable
              style={styles.panelOverlay}
              onPress={closePanel}
            >
              <Animated.View style={[styles.animatedPanel, animatedPanelStyle]}>
                <Text style={styles.panelTitle}>Passez Premium 👑</Text>
                <Text style={styles.panelContent}>
                  Profitez de toutes les fonctionnalités, séries exclusives, et plus encore !
                </Text>
                <TouchableOpacity
                  style={styles.panelButton}
                  onPress={() => {
                    closePanel();
                    router.push('/payment' as any);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>S'abonner</Text>
                </TouchableOpacity>
              </Animated.View>
            </Pressable>
          )}
        </>
      )}
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
  premiumBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a3cff',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 12,
  },
  premiumBannerText: {
    color: '#fff',
    fontWeight: 'light',
    fontSize: 16,
    marginBottom:3,
    textAlign: 'center',
  },
  premiumWord:{
    color: 'rgb(180, 177, 3)',
    fontSize: 18,
    fontWeight:'bold',
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
   panelOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, top: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  animatedPanel: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    elevation: 10,
    justifyContent: 'flex-start',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  panelContent: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  panelButton: {
    backgroundColor: '#1a3cff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent:'flex-end',
    marginBottom: 8,
  },
});