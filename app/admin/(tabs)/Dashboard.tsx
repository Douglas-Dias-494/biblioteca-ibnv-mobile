import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import leafIcon from '../../../assets/images/leaf-round-svgrepo-com.png'


type ErrorState = string | null;

export default function Dashboard() {

  const [totalLivros, setTotalLivros] = useState(null)
  const [livrosSolicitados, setLivrosSolicitados] = useState(null)
  const [livrosEmprestados, setLivrosEmprestados] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>('')

  const API_URL = 'http://192.168.15.15:3001/api/livros'

  useEffect(() => {
    const fetchTotalLivros = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/count`);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        setTotalLivros(data.totalLivros);
      } catch (err) {
        console.error("Falha ao buscar total de livros:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalLivros();

  }, [])

  useEffect(() => {
  const fetchTotalRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/requests`);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        setLivrosSolicitados(data.livrosSolicitados);
      } catch (err) {
        console.error("Falha ao buscar total de requisições:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalRequests();

  }, [])

    useEffect(() => {
  const fetchTotalRequestedBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/requested-books`);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        setLivrosEmprestados(data.livrosEmprestados);
      } catch (err) {
        console.error("Falha ao buscar total de requisições:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalRequestedBooks();

  }, [])


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#005613' }}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}>
            <Image source={leafIcon} style={{ width: 50, height: 50 }} />
            <Text style={{ fontSize: 20 }}>ADMIN IBNV</Text>
          </View>
        </View>
        <ScrollView>
          {/*Aqui será os quadradinhos com as informações do acervo de livros*/}
          <View style={styles.panelOptions}>
            <View style={styles.panelColumns}>
              <View style={styles.panelDivs}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" /> // Mostra um indicador de carregamento
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text> // Mostra a mensagem de erro
                ) : (
                  // Se não houver carregamento nem erro, mostra o total de livros
                  <Text style={styles.panelValue}>Acervo: {totalLivros}</Text>
                )}
              </View>


              <View style={styles.panelDivs}>
                                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" /> // Mostra um indicador de carregamento
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text> // Mostra a mensagem de erro
                ) : (
                  // Se não houver carregamento nem erro, mostra o total de livros
                  <Text style={styles.panelValue}>Livros emprestados: {livrosEmprestados}</Text>
                )}
              </View>
            </View>


            <View style={styles.panelColumns}>
              <View style={styles.panelDivs}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" /> // Mostra um indicador de carregamento
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text> // Mostra a mensagem de erro
                ) : (
                  // Se não houver carregamento nem erro, mostra o total de livros
                  <Text style={styles.panelValue}>Solicitações pendentes: {livrosSolicitados}</Text>
                )}
              </View>

              <View style={styles.panelDivs}>
                <Text>Prazos vencidos</Text>
              </View>
            </View>


          </View>
          <View style={{ flex: 1 }}>
            <Text>ADICIONAR NOVOS LIVROS AOS DESTAQUES</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: '10%',
    backgroundColor: 'white',
    justifyContent:'center'
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  panelOptions: {
    
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: '#f0f0f0',
    width: '100%',
    borderWidth: 1
  },
  panelColumns: {
    
    flexDirection: 'column',
    justifyContent: 'space-around', 
    alignItems: 'center', 
    width: '48%', 
    marginHorizontal: '1%', 
  },
  panelDivs: {
    backgroundColor: '#a0d9e1',
    width: '90%', 
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10, 
  },
  panelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  panelValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#005613',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  }
})