import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Remplace l'URL par celle de ton API
    fetch('http://localhost:3001/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#eee', paddingTop: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 }}>
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
        <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Séries</Text>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Ionicons name="log-out-outline" size={28} color="#1a3cff" />
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
          ]}>
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