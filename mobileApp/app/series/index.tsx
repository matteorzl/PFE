import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, Dimensions, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useStripe } from '@stripe/stripe-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  { Svg,Path, Rect, Circle, Polygon } from 'react-native-svg';
import CheckoutForm from '@/components/checkout-form.native';

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
  is_free: number;
};

export default function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false)
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

  const StarsDifficulty = ({ difficulty }: { difficulty: string | number }) => {
    let yellow = 1;
    if (difficulty === "MOYEN" || difficulty === 2) yellow = 2;
    if (difficulty === "DIFFICILE" || difficulty === 3) yellow = 3;

    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <Svg
            key={i}
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <Polygon
              points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
              fill="rgba(0,0,0,1)"
              stroke="none"
              // Décale l’ombre de 1px en bas et à droite
              transform="translate(1,1)"
            />
            <Polygon
              points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
              fill={i <= yellow ? "#FFD700" : "#eee"}
              stroke="#FFC04C"
              strokeWidth="1"
            />
          </Svg>
        ))}
      </View>
    );
  };

  const CrownIcon = () => (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 64 64"
      style={{ marginRight: 8
      }}
    >
      <Path d="M8 22L20 38L32 20L44 38L56 22L50 48H14L8 22Z" fill="#FFD700" stroke="#C9A000" strokeWidth="2" strokeLinejoin="round" />
      <Rect x="18" y="48" width="28" height="6" rx="1" fill="#C9A000" />
      <Circle cx="8" cy="22" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
      <Circle cx="32" cy="20" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
      <Circle cx="56" cy="22" r="3" fill="#FFD700" stroke="#C9A000" strokeWidth="1" />
    </Svg>
  );

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

  const handlePaymentSuccess = () => {
    // Rafraîchir le statut premium
    if (userId) {
      fetch(`http://172.20.10.2:3001/api/user/${userId}/premium`)
        .then(res => res.json())
        .then(data => setIsPremium(data.premium))
        .catch(() => setIsPremium(false));
    }
    // Fermer le panneau
    closePanel();
  };

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
        {filteredCategories.map((cat: any, idx) => {
          const isLocked = !isPremium && cat.is_free === 0;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.card,
                cat.progress === 100 && { borderColor: '#FFD600', borderWidth: 3 }
              ]}
              onPress={() => {
                if (!isLocked) {
                  router.push(`/series/${cat.id}` as any);
                }
              }}
              activeOpacity={isLocked ? 1 : 0.7}
              disabled={isLocked}
            >
              <Image
                source={{ uri: cat.image }}
                style={[
                  styles.cardImage,
                  isLocked && styles.locked
                ]}
                resizeMode="cover"
                blurRadius={isLocked ? 10 : (cat.progress === 0 ? 2 : 0)}
              />
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardTitle}>
                    {cat.is_free === 0 && <CrownIcon />}
                    {cat.name}
                  </Text>
                  
                </View>
                <View style={{ alignItems: 'center' }}>
                  <StarsDifficulty difficulty={cat.difficulty} />
                  <Text style={styles.progressLabel}>{cat.progress}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {!isPremium && (
        <>
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.85}
            onPress={openPanel}
          >
            <Text style={styles.premiumBannerText}>
              Passe <CrownIcon/> 
              <Text style={styles.premiumWord}>Premium </Text>
              <CrownIcon/> pour débloquer toutes les fonctionnalités !
            </Text>
          </TouchableOpacity>
          {panelOpen && (
            <Pressable
              style={styles.panelOverlay}
              onPress={closePanel}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'flex-end' }}
              >
                <Animated.View style={[styles.animatedPanel, animatedPanelStyle]}>
                  <Text style={styles.panelTitle}>Passez Premium 👑</Text>
                  <Text style={styles.panelContent}>
                    Profitez de toutes les fonctionnalités, séries exclusives, et plus encore !
                  </Text>
                  {userId && <CheckoutForm userId={userId} onPaymentSuccess={handlePaymentSuccess}/>}
                </Animated.View>
              </KeyboardAvoidingView>
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
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'right',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  locked:{
    borderWidth:2,
    borderRadius:16,
    borderColor: "rgba(255, 215, 0, 0.9)",
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
  }
});