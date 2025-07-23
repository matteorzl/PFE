import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectList } from 'react-native-dropdown-select-list'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserScreen() {
  const [user, setUser] = useState<any | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'bank' | 'therapist'>('infos');
  const [isPremium, setIsPremium] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [firstname, setFirstname] = useState(user?.firstname || '');
  const [lastname, setLastname] = useState(user?.lastname || '');
  const [mail, setMail] = useState(user?.mail || '');
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [parentFirstname, setParentFirstname] = useState(patient?.parent_firstname || '');
  const [parentLastname, setParentLastname] = useState(patient?.parent_lastname || '');
  const [phone, setPhone] = useState(patient?.phone || '');
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const [therapists, setTherapists] = useState<any[]>([]);
  const [patientTherapist, setPatientTherapist] = useState<any | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [affiliationCount, setAffiliationCount] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const router = useRouter();

  // Fonction pour rafraîchir les infos utilisateur et patient
  async function refreshUserAndPatient() {
    if (userId) {
      setLoading(true);
      try {
        const [userData, patientData] = await Promise.all([
          fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`).then(res => res.json()),
          fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/patient/${userId}`).then(res => res.json())
        ]);
        setUser(userData);
        setPatient(patientData);
        if (patientData?.therapist_id) {
          fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/therapist/patient/${patientData.id}`)
            .then(res => res.json())
            .then(data => setPatientTherapist(data))
            .catch(() => setPatientTherapist(null));
        } else {
          setPatientTherapist(null);
        }
      } catch {
        setUser(null);
        setPatient(null);
        setPatientTherapist(null);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`).then(res => res.json()),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/patient/${userId}`).then(res => res.json())
      ])
      .then(([userData, patientData]) => {
        setUser(userData);
        setPatient(patientData);
        // Si le patient a déjà un therapist_id, on récupère ses infos
        if (patientData?.therapist_id) {
          fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/therapist/patient/${patientData.id}`)
            .then(res => res.json())
            .then(data => setPatientTherapist(data))
            .catch(() => setPatientTherapist(null));
        } else {
          setPatientTherapist(null);
        }
      })
      .catch(() => {
        setUser(null);
        setPatient(null);
        setPatientTherapist(null);
      })
      .finally(() => setLoading(false));
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'therapist') {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/therapists`)
        .then(res => res.json())
        .then(data => setTherapists(data))
        .catch(() => setTherapists([]));
      // Récupérer le compteur d'affiliation du patient
      if (patient?.affiliation_count !== undefined) {
        setAffiliationCount(patient.affiliation_count);
      }
    }
  }, [activeTab, patient]);

  useEffect(() => {
    if (userId) {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/${userId}/premium`)
        .then(res => res.json())
        .then(data => setIsPremium(data.premium))
        .catch(() => setIsPremium(false));
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname || '');
      setLastname(user.lastname || '');
      setMail(user.mail || '');
      setCountry(user.country || '');
      setCity(user.city || '');
    }
  }, [user]);

  useEffect(() => {
    setParentFirstname(patient?.parent_name || '');
    setParentLastname(patient?.parent_lastname || '');
    setPhone(patient?.phone || '');
  }, [patient]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1a3cff" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  async function assignTherapist(therapistId: string) {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/patient/${patient.id}/therapist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapist_id: therapistId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliationCount(data.affiliation_count);
        Alert.alert('Succès', 'Thérapeute assigné !');
        await refreshUserAndPatient();
      } else {
        Alert.alert('Erreur', 'Impossible d\'assigner le thérapeute');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau');
    }
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

  function getEndOfMonthDate() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return end.toLocaleDateString('fr-FR');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, justifyContent: 'flex-end' }}
    >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => router.replace('/series')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={34} color="#302f2f" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={34} color="#302f2f" />
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
                <TextInput style={styles.label}>Prénom :</TextInput>
                  <TextInput
                    style={[
                      styles.value,
                      editMode && { color: '#b0b0b0' }
                    ]}
                    value={firstname}
                    onChangeText={setFirstname}
                    editable={editMode}
                    placeholder="Prénom"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.content}>
                <TextInput style={styles.label}>Nom :</TextInput>
                  <TextInput
                    style={[
                      styles.value,
                      editMode && { color: '#b0b0b0' }
                    ]}
                    value={lastname}
                    onChangeText={setLastname}
                    editable={editMode}
                    placeholder="Nom"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.content}>
                <TextInput style={styles.label}>Mail :</TextInput>
                  <TextInput
                    style={[
                      styles.value,
                      editMode && { color: '#b0b0b0' }
                    ]}
                    value={mail}
                    onChangeText={setMail}
                    editable={editMode}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.content}>
                  <TextInput style={styles.label}>Pays :</TextInput>
                    <TextInput
                      style={[
                        styles.value,
                        editMode && { color: '#b0b0b0' }
                      ]}
                      value={country}
                      onChangeText={setCountry}
                      editable={editMode}
                      placeholder="Pays"
                      autoCapitalize="words"
                    />
                </View>
                <View style={styles.content}>
                  <TextInput style={styles.label}>Ville :</TextInput>
                  <TextInput
                    style={[
                      styles.value,
                      editMode && { color: '#b0b0b0' }
                    ]}
                    value={city}
                    onChangeText={setCity}
                    editable={editMode}
                    placeholder="Ville"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.content}>
                  <TextInput style={styles.label}>Prénom du parent :</TextInput>
                    <TextInput
                      style={[
                        styles.value,
                        editMode && { color: '#b0b0b0' }
                      ]}
                      value={parentFirstname}
                      onChangeText={setParentFirstname}
                      editable={editMode}
                      placeholder="Prénom du parent"
                      autoCapitalize="words"
                    />
                </View>
                <View style={styles.content}>
                  <TextInput style={styles.label}>Nom du parent :</TextInput>
                    <TextInput
                      style={[
                        styles.value,
                        editMode && { color: '#b0b0b0' }
                      ]}
                      value={parentLastname}
                      onChangeText={setParentLastname}
                      editable={editMode}
                      placeholder="Nom du parent"
                      autoCapitalize="words"
                    />
                </View>
                <View style={styles.contentLast}>
                  <TextInput style={styles.label}>Téléphone :</TextInput>
                    <TextInput
                      style={[
                        styles.value,
                        editMode && { color: '#b0b0b0' }
                      ]}
                      value={phone}
                      onChangeText={setPhone}
                      editable={editMode}
                      placeholder="Téléphone"
                      keyboardType="numeric"
                    />
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginTop: 16 }}>
                  {!editMode ? (
                    <TouchableOpacity style={styles.button} onPress={() => setEditMode(true)}>
                      <Text style={styles.buttonText}>Modifier</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={async () => {
                        try {
                          const resUser = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ firstname, lastname, mail, country, city }),
                          });
                          const resPatient = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/patient/${patient.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ parent_firstname: parentFirstname, parent_lastname: parentLastname, phone: phone }),
                          });
                          if (resUser.ok && resPatient.ok) {
                            Alert.alert('Succès', 'Informations mises à jour !');
                            setEditMode(false);
                            // Optionnel : rafraîchir les infos utilisateur
                          } else {
                            Alert.alert('Erreur', 'Impossible de mettre à jour les informations');
                          }
                        } catch (err) {
                          Alert.alert('Erreur', 'Erreur réseau');
                        }
                      }}
                    >
                      <Text style={styles.buttonText}>Enregistrer</Text>
                    </TouchableOpacity>
                  )}
                </View>
            </>
          ) : activeTab === 'bank' ? (
            <>
              <View style={styles.contentFirst}>
                <Text style={styles.tab}>Statut abonnement</Text>
              </View>
              <View style={styles.tab}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: isPremium ? '#F1D700' : '#302f2f',
                    margin: 10,
                    alignSelf: 'center',
                  }}
                >
                  {isPremium ? '👑 Premium 👑' : 'Non premium'}
                </Text>
              </View>
              {isPremium && (
                <View style={styles.tab}>
                  <Text
                    style={{
                      fontSize: 14,
                      alignSelf: 'center',
                      marginBottom: 4,
                    }}
                  >
                    Fin d'abonnement : {getEndOfMonthDate()}
                  </Text>
                </View>
              )}
            </>
          ) : activeTab === 'therapist' && (
            <>
              <View style={[styles.contentFirst, {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
                <View style={{flex:1, alignItems:'center'}}>
                  <Text style={[styles.tab, {textAlign:'center'}]}>Orthophoniste</Text>
                </View>
                <TouchableOpacity onPress={() => setShowInfo(v => !v)} style={{marginRight: 8}}>
                  <MaterialIcons name="info-outline" size={18} color="#5558fd" />
                </TouchableOpacity>
              </View>
              {!patient?.therapist_id ? (
                <>
                  <View style={styles.tab}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Sélectionner un thérapeute :</Text>
                  </View>
                  <View style={styles.tab}>
                    {therapists.length === 0 ? (
                      <Text>Aucun thérapeute disponible.</Text>
                    ) : (
                      <>
                        <SelectList
                          setSelected={setSelectedTherapistId}
                          data={therapists.map((t: any) => ({ key: t.id, value: t.name }))}
                          placeholder="Sélectionner un thérapeute"
                          search={true}
                          boxStyles={{ marginBottom: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}
                          dropdownStyles={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}
                        />
                        <TouchableOpacity
                          style={[styles.button, { opacity: selectedTherapistId && affiliationCount < 3 ? 1 : 0.5 }]}
                          disabled={!selectedTherapistId || affiliationCount >= 3}
                          onPress={() => {
                            if (affiliationCount >= 3) {
                              Alert.alert('Limite atteinte', 'Vous avez atteint la limite de demandes. Veuillez contacter un administrateur.');
                              return;
                            }
                            assignTherapist(selectedTherapistId || '');
                          }}
                        >
                          <Text style={styles.buttonText}>Valider</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', width: '100%'}}>
                  {patient.is_accepted === 1 ? (
                    <Text style={[styles.value,{margin:8, textAlign:'center',fontWeight:'bold'}]}>
                      {patientTherapist[0].name}
                    </Text>
                  ) : (
                    <View style={{ alignItems: 'center', width: '100%', marginTop: 16 }}>
                      <Text style={[styles.value, {marginTop:8, textAlign:'center'}]}>En attente de validation</Text>
                      {showInfo && (
                        <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#5558fd', width: 260 }}>
                          <Text style={{ color: '#302f2f', fontSize: 13, marginBottom: 6 }}>
                            Vous pouvez faire jusqu&apos;à 3 demandes d&apos;affiliation à un orthophoniste. Au-delà, votre compte sera bloqué et un administrateur devra intervenir.
                          </Text>
                          <Text style={{ color: '#5558fd', fontWeight: 'bold', fontSize: 14 }}>
                            Nombre de demandes effectuées : {affiliationCount} / 3
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.button, {marginTop:8, backgroundColor:'#ff4d4d', opacity: affiliationCount >= 3 ? 0.5 : 1}]}
                        disabled={affiliationCount >= 3}
                        onPress={async () => {
                          try {
                            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/patient/${patient.id}/therapist`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ therapist_id: null }),
                            });
                            if (res.ok) {
                              Alert.alert('Succès', 'Demande annulée.');
                              setPatient({ ...patient, therapist_id: null });
                              setPatientTherapist(null);
                              await refreshUserAndPatient();
                            } else {
                              Alert.alert('Erreur', 'Impossible d\'annuler la demande');
                            }
                          } catch (err) {
                            Alert.alert('Erreur', 'Erreur réseau');
                          }
                        }}
                      >
                        <Text style={styles.buttonText}>Annuler la demande</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </View>
      </ScrollView>
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
            <Text style={[styles.tabBarText, activeTab === 'bank' && styles.tabBarTextActive]}>Abonnement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('therapist')}
          >
            <Ionicons name="medical-outline" size={22} color={activeTab === 'therapist' ? "#5558fd" : "#888"} />
            <Text style={[styles.tabBarText, activeTab === 'therapist' && styles.tabBarTextActive]}>Docteur</Text>
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow:1,
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
  logoutButton: {
    position: 'absolute',
    top: 45,
    right: 16,
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
    marginTop:20,
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
    fontSize: 30,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#302f2f',
    margin: 12,
    alignSelf: 'center',
  },
  label: {
    width:'25%',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#302f2f',
    margin: 10,
  },
  value: {
    fontSize: 15,
    fontWeight: 'light',
    width:'80%',
    color: '#5558fd',
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
  button: {
    backgroundColor: '#1a3cff',
    padding: 3,
    borderRadius: 50,
    minWidth: '80%',
    margin:8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})