
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import leafIcon from '../../assets/images/leaf-round-svgrepo-com.png'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Livro } from '../../types/Livros'

type RootStackParamList = {
  Home: undefined; // Home não recebe parâmetros
  'books/descritiveBookPage': { book: Livro }; // DetalhesDoLivro espera um objeto 'book' do tipo Livro
}


const Home = () => {

  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const response = await axios.get('http://192.168.15.15:3001/api/livros/disponiveis');
        setLivros(response.data);
      } catch (err) {
        console.error('Erro ao buscar livros:', err);
        setError('Não foi possível carregar os livros. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, []);

  const handleBookPress = (book: Livro) => {
  // Verifique o tipo de 'book' aqui. Deveria ser um objeto.
  console.log("Home.tsx: Tipo de 'book' antes de stringify:", typeof book, book);
  navigation.navigate('books/descritiveBookPage', { book: JSON.stringify(book) });
}


  if (loading) {
    return (
      <SafeAreaView style={styles.safeView}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005613" />
          <Text>Carregando livros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeView}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Image source={leafIcon} style={styles.logoImg} />
            <Text style={{ fontSize: 18 }}>Biblioteca IBNV</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', width: 80, justifyContent: 'space-between' }}>

            <TouchableOpacity>
              <FontAwesome6 name="gear" size={26} color="#005613" />
            </TouchableOpacity>

            <TouchableOpacity>
              <MaterialCommunityIcons name="account-circle" size={29} color="#005613" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerBooks}>
          <View style={styles.topMenuBooks}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Novos títulos pra você</Text>
            <TouchableOpacity>
              <FontAwesome name="question-circle" size={24} color="#005613" />
            </TouchableOpacity>
          </View>
          <View>
            <FlatList
              data={livros}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cardBooks}
                  onPress={() => {
                    console.log("Home.tsx: Clicado no Livro:", item.titulo || item.livroId);
                    handleBookPress(item)

                  }}
                >
                  {item.imagem ? (
                    <Image
                      source={{ uri: `http://192.168.15.15:3001/images/${item.imagem}` }}
                      style={{ width: 160, height: 230 }}
                    />
                  ) : (
                    <View>
                      <Text>Sem imagens</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.livroId.toString()}
            />


          </View>
        </View>

        <View style={styles.MyBooks}>
          <AntDesign name="warning" size={50} color="#005613" />
          <Text style={{ color: '#005613' }}>Você não possui requisições ativas</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: '#005613'
  },
  mainContainer: {
    flex: 1,
    padding: 1


  },
  header: {
    height: '10%',
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15

  },
  containerBooks: {
    backgroundColor: '#F0F0F0',
    height: '50%'
  },
  topMenuBooks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center'

  },
  cardBooks: {
    padding: 10
  },
  logoImg: {
    width: 50,
    height: 50,

  },
  MyBooks: {
    backgroundColor: '#F0F0F0',
    height: '45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    gap: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  }
})

export default Home