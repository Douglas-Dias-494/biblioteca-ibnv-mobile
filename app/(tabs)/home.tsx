import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import leafIcon from '../../assets/images/leaf-round-svgrepo-com.png'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Livro } from '@/types/Livros'
import { Solicitacao } from '@/types/Solicitacao'; // Certifique-se que esta interface inclui 'status: string;'

type RootStackParamList = {
  Home: undefined;
  'books/descritiveBookPage': { book: Livro };
}

// Funções auxiliares para determinar o texto e a cor do status
// Podem ser definidas fora do componente para evitar recriação em cada render
const getStatusText = (status: string) => {
  switch (status) {
    case 'pendente':
      return 'Solicitado';
    case 'aceito':
      return 'Aceito';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendente':
      return '#FFA500'; // Laranja para pendente
    case 'aceito':
      return '#005613'; // Verde para aceito
    case 'recusado':
      return '#FF0000'; // Vermelho para recusado
    default:
      return '#333333'; // Cor padrão
  }
};

const Home = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  const fetchSolicitacoes = async () => {
    try {
      setIsRefreshing(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Verifique se este endpoint realmente retorna o status da solicitação
      // E se ele filtra por usuário logado (para "Suas solicitações ativas")
      const res = await axios.get("http://192.168.15.15:3001/api/email/solicitacoes/pendentes", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // O backend deve retornar um array de objetos de solicitação, cada um com um campo 'status'
      setSolicitacoes(res.data.solicitacoes);
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
      // Opcional: setError para exibir na UI
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const handleBookPress = (book: Livro) => {
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
                    handleBookPress(item)
                  }}
                >
                  {item.imagem ? (
                    <Image
                      source={{ uri: `http://192.168.15.15:3001/images/${item.imagem}` }}
                      style={{ width: 160, height: 230 }}
                    />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Text style={styles.noImageText}>Sem imagem</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.livroId.toString()}
            />
          </View>
        </View>

        {solicitacoes.length === 0 ? (
          <View style={styles.MyBooks}>
            <AntDesign name="warning" size={50} color="#005613" />
            <Text style={{ color: '#005613' }}>Você não possui requisições ativas</Text>
            <TouchableOpacity onPress={fetchSolicitacoes}>
              {isRefreshing ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <FontAwesome name="refresh" size={24} color="#005613" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.MyBooks}>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 150 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Suas solicitações ativas:</Text>
              <TouchableOpacity onPress={fetchSolicitacoes}>
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <FontAwesome name="refresh" size={24} color="#005613" />
                )}
              </TouchableOpacity>
            </View>
            <FlatList
              data={solicitacoes}
              keyExtractor={(item) => item.id.toString()} // Usar item.id se disponível e único
              renderItem={({ item }) => (
                <View style={styles.solicitacaoCard}>
                  <View style={styles.solicitacaoCardContent}>
                    {/* SITUAÇÃO DINÂMICA AQUI */}
                    <View style={styles.statusDisplay}>
                      <Text style={styles.statusLabel}>SITUAÇÃO: </Text>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                      </Text>
                    </View>

                    <View style={styles.bookRequestInfo}>
                      <Image
                        source={{ uri: `http://192.168.15.15:3001/images/${item.imagem_url}` }}
                        style={styles.requestedBookImage}
                        onError={(e) => {
                          console.log('Erro ao carregar imagem do livro solicitado:', e.nativeEvent.error);
                          // Fallback para imagem local ou texto "Sem Imagem"
                        }}
                      />
                      <View style={styles.requestedBookDetails}>
                        <Text><Text style={styles.boldText}>Título:</Text> {item.titulo}</Text>
                        <Text><Text style={styles.boldText}>Autor:</Text> {item.autor}</Text>
                        <Text><Text style={styles.boldText}>Data do pedido:</Text> {item.data_solicitacao_formatada}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15
  },
  containerBooks: {
    backgroundColor: '#F0F0F0',
    height: '50%'
  },
  topMenuBooks: {
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
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  noImageContainer: {
    width: 160,
    height: 230,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    textAlign: 'center',
  },
  // Estilos para as solicitações ativas
  solicitacaoCard: {
    backgroundColor: '#FFF',
    width: 350,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  solicitacaoCardContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  statusDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookRequestInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestedBookImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  requestedBookDetails: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 250,
    marginLeft: 15,
  },
  boldText: {
    fontWeight: 'bold',
  }
});

export default Home;