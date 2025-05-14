import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Bienvenue dans SoundSwipes !</ThemedText>
      <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/login" style={{color:'blue', marginTop: 15, paddingVertical: 15 }}>
            <ThemedText type="link">Go to login screen!</ThemedText>
        </Link>
    </ThemedView>
  );
}