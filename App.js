import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@my_favorites_ids';
const USERS_KEY = '@my_users_data';

export default function App() {
  const [users, setUsers] = useState([]); // Données API + utilisateurs ajoutés
  const [favorites, setFavorites] = useState([]); // Liste des ID favoris
  const [isLoading, setIsLoading] = useState(true); // Indicateur de chargement
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Filtre favoris
  const [newUserName, setNewUserName] = useState(''); // Formulaire POST - Nom
  const [newUserEmail, setNewUserEmail] = useState(''); // Formulaire POST - Email
  const [isPostLoading, setIsPostLoading] = useState(false); // Chargement du POST

  useEffect(() => {
    loadData();
  }, []); 

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(response.data);

      const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs)); 
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    } finally {
      setIsLoading(false); // Arrêt du chargement quoi qu'il arrive
    }
  };

  const toggleFavorite = async (userId) => {
    try {
      let newFavorites;
      if (favorites.includes(userId)) {
        newFavorites = favorites.filter((id) => id !== userId);
      } else {
        newFavorites = [...favorites, userId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
    }
  };

  const clearAllFavorites = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir effacer tous les favoris ?',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Effacer',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(FAVORITES_KEY);
              setFavorites([]);
              Alert.alert('Succès', 'Tous les favoris ont été supprimés');
            } catch (error) {
              console.error('Erreur lors de l\'effacement', error);
              Alert.alert('Erreur', 'Impossible d\'effacer les favoris');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const addNewUser = async () => {
    // Validation des champs
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsPostLoading(true);
    try {
      // Appel POST à l'API JSONPlaceholder (simulation)
      const response = await axios.post(
        'https://jsonplaceholder.typicode.com/users',
        {
          name: newUserName,
          email: newUserEmail,
          username: newUserName.toLowerCase().replace(' ', '_'),
        }
      );

      // L'API retourne l'ID généré (simulé)
      const newUser = response.data;

      // Ajout du nouvel utilisateur à la liste locale
      setUsers([...users, newUser]);

      // Réinitialisation du formulaire
      setNewUserName('');
      setNewUserEmail('');

      Alert.alert('Succès', `Utilisateur "${newUserName}" ajouté avec l'ID ${newUser.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'utilisateur');
    } finally {
      setIsPostLoading(false);
    }
  };

  // --- RENDU GRAPHIQUE (RENDER) ---

  // Composant pour un item de la liste
  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={[styles.favButton, isFav ? styles.favActive : styles.favInactive]}
        >
          <Text style={styles.favText}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Données filtrées selon l'état showOnlyFavorites
  const displayedUsers = showOnlyFavorites
    ? users.filter((user) => favorites.includes(user.id))
    : users;

  // Affichage principal
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <Text style={styles.header}>Connexion API</Text>

        {/* 🎯 DÉFI FILTRAGE : Bouton pour filtrer les favoris */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
            style={[
              styles.filterButton,
              showOnlyFavorites && styles.filterButtonActive,
            ]}
          >
            <Text style={styles.filterButtonText}>
              {showOnlyFavorites ? ' Afficher tous' : ' Afficher favoris'}
            </Text>
          </TouchableOpacity>

          {/* 🔒 DÉFI SÉCURITÉ : Bouton Effacer tout */}
          <TouchableOpacity
            onPress={clearAllFavorites}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}> Effacer tout</Text>
          </TouchableOpacity>
        </View>

        {/* 📝 DÉFI API POST : Formulaire d'ajout */}
        
        {!showOnlyFavorites && (
        <View style={styles.formSection}>
        <Text style={styles.formTitle}> Ajouter un utilisateur</Text>

        <TextInput
         style={styles.textInput}
         placeholder="Nom complet"
         placeholderTextColor="#999"
         value={newUserName}
         onChangeText={setNewUserName}
         editable={!isPostLoading}
        />

        <TextInput
         style={styles.textInput}
         placeholder="Email"
         placeholderTextColor="#999"
         value={newUserEmail}
         onChangeText={setNewUserEmail}
         keyboardType="email-address"
         editable={!isPostLoading}
        />

        <TouchableOpacity
         onPress={addNewUser}
         style={[styles.addButton, isPostLoading && styles.addButtonDisabled]}
         disabled={isPostLoading}
        >
        {isPostLoading ? (
        <ActivityIndicator size="small" color="#fff" />
        ) : (
        <Text style={styles.addButtonText}>Ajouter</Text>
        )}
        </TouchableOpacity>
       </View>
)}


        {/* Chargement initial */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loaderText}>Chargement des contacts...</Text>
          </View>
        ) : (
          <>
            {/* Message si aucun résultat */}
            {displayedUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {showOnlyFavorites
                    ? 'Aucun favori pour le moment'
                    : 'Aucun utilisateur trouvé'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={displayedUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                scrollEnabled={false} // Désactivé car dans ScrollView
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
  },
  // Styles pour le filtrage
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#df6077ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Styles pour le formulaire
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#56b8c9ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour la liste
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  favButton: {
    padding: 10,
    borderRadius: 20,
  },
  favActive: {
    backgroundColor: '#fff3cd',
  },
  favInactive: {
    backgroundColor: '#f0f0f0',
  },
  favText: {
    fontSize: 24,
    color: '#2a6418c1',
  },
});