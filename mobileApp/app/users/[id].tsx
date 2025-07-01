import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserScreen() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'bank'>('infos');
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetch(`http://172.20.10.2:3001/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1a3cff" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.replace('/series')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#1a3cff" />
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.name}>Utilisateur introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/series')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={34} color="#302f2f" />
        </TouchableOpacity>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={90} color="#302f2f" />
        <Text style={styles.name}>{user.firstname} {user.lastname}</Text>
        <View style={styles.cardContent}>
          {activeTab === 'infos' ? (
            <>
              <View style={styles.contentFirst}>
                <Text style={styles.tab}>Infos Personnelles</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Nom : <Text style={styles.value}>{user.lastname}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Prénom : <Text style={styles.value}>{user.firstname}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Email : <Text style={styles.value}>{user.mail}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>Ville : <Text style={styles.value}>{user.city}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
              <View style={styles.contentLast}>
                <Text style={styles.label}>Pays : <Text style={styles.value}>{user.country}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.contentFirst}>
                <Text style={styles.tab}>Infos Bancaires</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>IBAN :<Text style={styles.value}>{user.iban || 'Non renseigné'}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
              <View style={styles.contentLast}>
                <Text style={styles.label}>Banque : <Text style={styles.value}>{user.bank || 'Non renseigné'}</Text></Text>
                <Text style={styles.chevron}>&gt;</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('infos')}
        >
          <Ionicons name="person-outline" size={22} color={activeTab === 'infos' ? "#5558fd" : "#888"} />
          <Text style={[styles.tabBarText, activeTab === 'infos' && styles.tabBarTextActive]}>Infos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('bank')}
        >
          <Ionicons name="card-outline" size={22} color={activeTab === 'bank' ? "#5558fd" : "#888"} />
          <Text style={[styles.tabBarText, activeTab === 'bank' && styles.tabBarTextActive]}>Bancaires</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2fa',
    paddingTop: 24,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  card: {
    marginTop: 28,
    marginHorizontal: 6,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    alignItems: 'flex-start',
    marginTop:60,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderColor:'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#302f2f',
    marginBottom: 16,
  },
  chevron: {
    color: 'rgba(0,0,0,0.2)',
    fontSize: 16,
    margin:2,
    fontWeight: 'light',
    alignSelf: 'center',
  },
  contentFirst: {
    padding: 1,
    borderBottomWidth: 1,
    width: '100%',
    borderBottomColor: 'rgba(0,0,0,0.2)'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
    borderBottomWidth: 1,
    width: '100%',
    borderBottomColor: 'rgba(0,0,0,0.2)'
  },
  contentLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
    width: '100%',
  },
  tab: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#302f2f',
    margin: 12,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#302f2f',
    margin: 10,
  },
  value: {
    justifyContent:'space-between',
    fontSize: 16,
    fontWeight: 'light',
    color: '#5558fd',
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    borderRadius: 26,
    position: 'absolute',
    bottom: 10,
    margin:10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    borderColor:'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabBarText: {
    color: '#888',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
  tabBarTextActive: {
    color: '#5558fd',
  },
});