import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  Alert, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.1.60:3001/api/login', {
        email,
        password,
      });

      if (response.status === 200) {
        router.push('/home');
      } else {
        Alert.alert('Erreur', 'Connexion échouée');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
      } else if (error.response && error.response.status === 401) {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter au serveur');
      }
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>
          SoundSwipes
        </ThemedText>
        <TextInput
          placeholder="Adresse mail"
          style={styles.input}
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Mot de passe"
          style={styles.input}
          placeholderTextColor="#808080"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginText}>Se connecter</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    height: 125,
    width: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#000000',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171BF3',
    borderRadius: 8,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
