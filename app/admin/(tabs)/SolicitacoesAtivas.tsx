import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  ScrollView,
  Alert // Usaremos Alert do RN para notificações simples
} from 'react-native';

// Interface para tipar os dados de cada solicitação
interface Solicitacao {
  id: number;
  usuario_email: string;
  titulo: string;
  autor: string;
  categoria: string;
  ano_publicacao: number;
  imagem_url: string;
  data_solicitacao_formatada: string;
}

// URL base da sua API (ajuste conforme necessário para seu ambiente de desenvolvimento/produção)
// Se estiver rodando no emulador, use o IP da sua máquina ou '10.0.2.2' para Android emulator
// ou 'localhost' para iOS simulator.
const API_BASE_URL = 'http://192.168.15.15:3001/api/email'; // Exemplo: ajuste para o IP do seu backend

export default function SolicitacoesAtivas() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar as solicitações pendentes do backend
  const fetchSolicitacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token'); // Ou como você armazena o token no RN
      const response = await fetch(`${API_BASE_URL}/solicitacoes/pendentes`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || `Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSolicitacoes(data.solicitacoes);
    } catch (err: any) {
      console.error('Erro ao buscar solicitações:', err);
      setError('Não foi possível carregar as solicitações. Verifique sua conexão ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar as solicitações quando o componente é montado
  useEffect(() => {
    fetchSolicitacoes();
  }, []); 

  // Função para aceitar uma solicitação
  const handleAccept = async (solicitacaoId: number) => {
    Alert.alert(
      "Confirmar Aceite",
      "Tem certeza que deseja aceitar esta solicitação?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Aceitar",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token'); // Ou como você armazena o token no RN
              const response = await fetch(`${API_BASE_URL}/solicitacoes/${solicitacaoId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'aceito' })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensagem || `Erro HTTP: ${response.status} ${response.statusText}`);
              }

              await fetchSolicitacoes(); // Recarrega a lista
              Alert.alert('Sucesso', 'Solicitação aceita com sucesso!');
            } catch (err: any) {
              console.error('Erro ao aceitar solicitação:', err);
              Alert.alert('Erro', `Erro ao aceitar solicitação: ${err.message || 'Tente novamente.'}`);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando solicitações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSolicitacoes}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Solicitações de Livros Pendentes</Text>
      </View>

      {solicitacoes.length === 0 ? (
        <Text style={styles.noRequestsText}>Nenhuma solicitação pendente encontrada.</Text>
      ) : (
        <View style={styles.solicitacoesList}>
          {solicitacoes.map((solicitacao) => (
            <View key={solicitacao.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Image
                  source={{ uri: `http://192.168.15.15:3001/images/${solicitacao.imagem_url}` || `https://placehold.co/100x150/CCE5FF/000000?text=Sem+Capa` }}
                  style={styles.bookImage}
                  onError={(e) => {
                    console.log('Erro ao carregar imagem:', e.nativeEvent.error);
                    // Você pode tentar carregar uma imagem local de fallback aqui se a URL falhar
                  }}
                />
                <View style={styles.bookDetails}>
                  <Text style={styles.bookTitle}>{solicitacao.titulo}</Text>
                  <Text style={styles.bookAuthor}>**Autor:** {solicitacao.autor}</Text>
                  <Text style={styles.bookCategory}>**Categoria:** {solicitacao.categoria}</Text>
                  <Text style={styles.bookYear}>**Ano:** {solicitacao.ano_publicacao}</Text>
                </View>
              </View>
              <View style={styles.requestDetails}>
                <Text style={styles.requestedBy}>**Solicitado por:** <Text style={styles.requestedByEmail}>{solicitacao.usuario_email}</Text></Text>
                <Text style={styles.requestDate}>**Data da Solicitação:** {solicitacao.data_solicitacao_formatada}</Text>
              </View>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(solicitacao.id)}
              >
                <Text style={styles.acceptButtonText}>Aceitar Solicitação</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRequestsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 50,
  },
  solicitacoesList: {
    gap: 16, // Espaçamento entre os cards
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Para Android
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  bookCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 13,
    color: '#666',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  requestedBy: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  requestedByEmail: {
    fontWeight: 'bold',
    color: '#333',
  },
  requestDate: {
    fontSize: 13,
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#28a745', // Verde
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
