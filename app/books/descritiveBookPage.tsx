import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Livro } from "@/types/Livros";
import { useState, useEffect } from "react";
import leafIcon from '../../assets/images/leaf-round-svgrepo-com.png'
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios";
import { jwtDecode } from "jwt-decode"

export default function DescritiveBookPage() {


  const params = useLocalSearchParams<{ book: string }>()
  const bookParam = params.book
  let parsedBook: Livro | null = null
  const bookString = Array.isArray(bookParam) ? bookParam[0] : bookParam
  const navigation = useNavigation()
  const [isRequested, setIsRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoadStatus, setInitialLoadStatus] = useState(true);

    useEffect(() => {
    const checkBookRequestStatus = async () => {
      // Só procede se o livro já foi parseado e temos um ID de livro
      if (!parsedBook || !parsedBook.livroId) {
        setInitialLoadStatus(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Se não há token, o usuário não está logado, então não há solicitação para verificar
        setInitialLoadStatus(false);
        return;
      }

      try {
        const decodedToken: { id: number } = jwtDecode(token); // Decodifique para pegar o userId
        const userId = decodedToken.id; // Ajuste 'id' para a propriedade correta no seu token

        // Faz a requisição GET para o novo endpoint do backend
        const response = await axios.get(
          `http://192.168.15.15:3001/api/email/livros/${parsedBook.livroId}/solicitacao-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: { // Pode ser necessário passar o userId aqui se seu backend não o pegar do token
              userId: userId
            }
          }
        );

        // Verifica a resposta do backend
        if (response.data.hasPendingRequest && response.data.status === 'pendente') {
          setIsRequested(true); // Se há solicitação pendente, define o botão como solicitado
        } else {
          setIsRequested(false); // Caso contrário, o botão fica no estado padrão
        }
      } catch (error) {
        console.error("Erro ao verificar status da solicitação inicial:", error);
        // Em caso de erro na verificação, assume que não está solicitado
        setIsRequested(false);
      } finally {
        setInitialLoadStatus(false); // Indica que o carregamento inicial terminou
      }
    };

    checkBookRequestStatus();
  }, [parsedBook])

  const handleBackPage = () => {
    navigation.goBack()
  }

  const bookSolicitationEmail = async () => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      Alert.alert('Você precisa estar logado para fazer a requisição.')
      return
    }

    if (!parsedBook) { 
        Alert.alert('Erro', 'Dados do livro não carregados.');
        return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      await axios.post("http://192.168.15.15:3001/api/email/solicitar-livro",
        {
          titulo: parsedBook!.titulo,
          autor: parsedBook!.autor,
          categoria: parsedBook!.categoria,
          anoPublicacao: parsedBook!.anoPublicacao,
          paginas: parsedBook!.paginas,
          livroId: parsedBook!.livroId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
setIsRequested(true);
      Alert.alert('Sucesso!', 'Empréstimo solicitado com sucesso!');

    } catch (error: any) { 
      console.error('Erro de envio de email:', error); 
      setIsRequested(false); 

      if (error.response && error.response.data && error.response.data.message) {

        if (error.response.data.message.includes('ORA-00001') || error.response.data.message.includes('UK_USUARIO_LIVRO')) {
          Alert.alert('Atenção', 'Você já solicitou este livro.');
        } else {
          Alert.alert('Erro', error.response.data.message);
        }
      } else if (error.request) {
        Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
  
        Alert.alert('Erro Inesperado', 'Houve um problema ao preparar a solicitação.');
      }
     

    } finally {
      setIsLoading(false); 
    }
  };
  if (bookString) {
    try {
      parsedBook = JSON.parse(bookString) as Livro;
    } catch (e) {
      console.error("descritiveBookPage.tsx: Erro ao parsear o JSON do livro:", e);
      // ...
    }
  } else {
    console.log("descritiveBookPage.tsx: Parâmetro 'book' não encontrado ou vazio.");
  }

  if (!parsedBook) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Livro não encontrado ou dados inválidos.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#005613' }}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="arrow-back-outline" size={24} color="#fff" onPress={handleBackPage} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>DESCRIÇÃO</Text>
          </View>



          {parsedBook.imagem ? ( // Agora 'parsedBook' é definitivamente 'Livro' aqui
            <Image
              source={{ uri: `http://192.168.15.15:3001/images/${parsedBook.imagem}` }}
              style={{ width: 160, height: 230 }}
            />
          ) : (
            <View>
              <Text>Sem imagem</Text>
            </View>
          )}

          <Text style={styles.title}>{parsedBook.titulo}</Text>

          <View style={styles.descriptiveDiv}>
            <View style={{ borderRightWidth: 2, width: 110 }}>
              <Text style={{ color: '#005613', fontWeight: 'bold' }}>Autor</Text>
              <Text>{parsedBook.autor}</Text>
            </View>
            <View style={{ borderRightWidth: 2, width: 110 }}>
              <Text style={{ color: '#005613', fontWeight: 'bold' }}>Categoria</Text>
              <Text>{parsedBook.categoria}</Text>
            </View>
            <View>
              <Text style={{ color: '#005613', fontWeight: 'bold' }}>Páginas</Text>
              <Text>{parsedBook.paginas}</Text>
            </View>
          </View>


          <Text style={styles.descricao}>{parsedBook.descricao}</Text>

          <Image source={leafIcon} style={{ width: 40, height: 40 }} />
<TouchableOpacity
            onPress={bookSolicitationEmail}
            disabled={isRequested || isLoading} // Desabilita o botão se já solicitado ou carregando
          >
            <View style={[
              styles.btnRequest,
              isRequested ? styles.btnRequestedSuccess : null, // Aplica estilo de sucesso
              isLoading ? styles.btnLoading : null // Aplica estilo de carregamento
            ]}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {isLoading ? 'ENVIANDO...' : (isRequested ? 'SOLICITADO' : 'SOLICITAR EMPRÉSTIMO')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    display: 'flex',
    justifyContent: "center"

  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%',
    height: 55,
    padding: 15,
    marginBottom: 35,
    backgroundColor: '#005613'
  },

  title: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: 'bold'
  },
  author: {
    marginTop: 5,
    fontSize: 18,
    color: '#005613',
    fontWeight: 'bold'
  },
  descricao: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 15,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    borderColor: '#005613',
    borderWidth: 2.5,
    padding: 20,
    width: '95%',
    textAlign: "justify",
    color: '#005613'

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptiveDiv: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "space-around",
    alignItems: "center",
    width: '95%',
    height: '8%',
    backgroundColor: '#fff',
    borderColor: '#005613',
    borderWidth: 2,
    padding: 20,
  },
  btnRequest: {
    marginTop: 15,
    marginBottom: 40,
    backgroundColor: '#005613',
    width: '48%',
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  // --- Novos estilos para o botão ---
  btnRequestedSuccess: {
    backgroundColor: '#28a745', // Cor verde para sucesso (pode ajustar)
  },
  btnLoading: {
    backgroundColor: '#ffc107', // Cor amarela/laranja para carregamento
  }
})