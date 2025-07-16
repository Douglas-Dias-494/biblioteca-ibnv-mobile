import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import leafIcon from '../../assets/images/leaf-round-svgrepo-com.png'
import { useState, useEffect } from 'react'
import { useNavigation } from 'expo-router'
import axios from 'axios'
import { Livro } from '../../types/Livros'
import { NavigationProp } from '@react-navigation/native'


type ErrorState = string | null;

type RootStackParamList = {
  AvalBooks: undefined; // Home não recebe parâmetros
  'books/descritiveBookPage': { book: Livro }; // DetalhesDoLivro espera um objeto 'book' do tipo Livro
}

const AvalBooks = () => {

  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>('')
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  useEffect(() => {
    const fetchLivrosAndCategorias = async () => {
      try {
        setLoading(true);
        setError(''); // Limpa erros anteriores
        const response = await axios.get<Livro[]>(`http://192.168.15.15:3001/api/livros/disponiveis`);
        setLivros(response.data);

        // Extrai categorias únicas e adiciona 'Todas'
        const categoriasUnicas = ['Todas', ...new Set(response.data.map(l => l.categoria))];
        setCategorias(categoriasUnicas);
      } catch (err) {
        console.error('Erro ao buscar livros', err);
        setError('Não foi possível carregar os livros. Verifique sua conexão.');
        Alert.alert('Erro', 'Não foi possível carregar os livros. Verifique sua conexão com o servidor ou tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchLivrosAndCategorias();
  }, [])

    const handleBookPress = (book: Livro) => {
    navigation.navigate('books/descritiveBookPage', { book: JSON.stringify(book) });
  }

  const livrosFiltrados = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(busca.toLowerCase()) &&
    (categoriaSelecionada === "Todas" || livro.categoria === categoriaSelecionada)
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando livros...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Image source={leafIcon} style={styles.logoImg} />
          <Text style={{fontSize: 18}}>Acervo de Livros</Text>
        </View>
        <View style={styles.searchDiv}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título..."
            value={busca}
            onChangeText={setBusca}
          />

          <Text style={styles.filterTitle}>Filtrar por Categoria:</Text>

          <View style={styles.categoryContainer}>
            <FlatList
              data={categorias}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    categoriaSelecionada === item && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setCategoriaSelecionada(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    categoriaSelecionada === item && styles.selectedCategoryText,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={livrosFiltrados}
          keyExtractor={(item) => item.livroId.toString()}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>

              {item.imagem ? (
                <TouchableOpacity
                onPress={() => {
                    handleBookPress(item)
                  }}               
                >
                <Image
                  source={{ uri: `http://192.168.15.15:3001/images/${item.imagem}` }}
                  style={{ width: 120, height: 180 }}
                />
                </TouchableOpacity>
              ) : (
                <View>
                  <Text>Sem imagens</Text>
                </View>
              )}
            <View style={styles.bookDesc}>
              <Text style={styles.bookTitle}>{item.titulo}</Text>
              <Text style={styles.bookCategory}>Categoria: {item.categoria}</Text>
              <Text style={styles.bookCategory}>Autor: {item.autor}</Text>
              <Text style={styles.bookCategory}>{item.editora}</Text>
            </View>
            </View>
          )}
          ListEmptyComponent={() => (
            !loading && livrosFiltrados.length === 0 && !error && (
              <Text style={styles.noResultsText}>Nenhum livro encontrado com os critérios selecionados.</Text>
            )
          )}
        />
      </View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: '#005613'
  },
  mainContainer: {
    backgroundColor: '#F0F0F0',
    height: '108%'
  },
  header: {
    height: '10%',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    gap: 5,
  },
  logoImg: {
    width: 50,
    height: 50,
  },
  searchDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  searchInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    width: '95%'
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#005613'
  },
  categoryContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    marginBottom: 20,
    height: 45,
    
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  selectedCategoryButton: {
    backgroundColor: '#005613',
    borderColor: '#005613',
  },
  categoryText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#005613',
  },
  bookCategory: {
    fontSize: 14,
    color: '#777',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  bookItem: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookDesc: {
    width:'65%',
    justifyContent: 'center',
    alignItems: 'center'
  }

})

export default AvalBooks