import { View, TextInput, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import leafIcon from '../assets/images/leaf-round-svgrepo-com.png'
import { useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

const Login = () => {

    //constantes para as funções
    const [dataForm, setDataform] = useState({ email: '', senha: '' })
    const [error, setError] = useState('')





    //funções
    const handleInputChange = (field) => (value) => {
        setDataform({ ...dataForm, [field]: value })
    }

    const handleSubmit = async () => {
        const { email, senha } = dataForm

        if (!email || !senha) {
            Alert.alert('ERRO!', 'Preencha todos os campos obrigatórios')
            return
        }

        try {
            const emailCheckResponse = await axios.post('http://192.168.15.15:3001/api/check-email', { email })
            const { emailExists } = emailCheckResponse.data

            if (!emailExists) {
                Alert.alert('Erro de Login', 'E-mail não cadastrado. Por favor, verifique seu e-mail ou cadastre-se.');
                 setDataform({ email: '', senha: '' })
                return
               
            }



            const response = await axios.post('http://192.168.15.15:3001/api/login', dataForm)

const { token, usuario } = response.data

await AsyncStorage.setItem('token', token)

// Redireciona com base na role
if (usuario.role === 'admin') {
  router.replace('/admin/(tabs)/Dashboard') // Altere se sua rota de admin tiver outro nome
} else {
  router.replace('/(tabs)/Home') // Rota padrão de usuário comum
}

Alert.alert('Sucesso', `Bem-vindo, ${usuario.nome}`)


        } catch (error) {
            console.error('Erro de login ou verificação de e-mail:', error);
            // Trate diferentes tipos de erro aqui, se necessário (ex: erro de rede, erro de credenciais)
            if (error.response && error.response.status === 401) {
                Alert.alert('Erro de Login', 'Credenciais inválidas. Verifique seu e-mail e senha.');
            } else {
                Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
            }
        }

    }



    // parte lógica dos componentes

    return (
        <SafeAreaView style={styles.safeView}>
            <View style={styles.mainContainer}>
                <View style={styles.logoContainer}>
                    <Image source={leafIcon} style={styles.logoImg} />
                    <Text style={{ fontSize: 20 }}>Biblioteca IBNV</Text>
                </View>
                <View style={styles.inputsContainer}>
                    <View style={styles.inputsBox}>
                        <Text>E-mail</Text>
                        <TextInput
                            style={{ backgroundColor: '#F0F0F0', borderWidth: 1 }}
                            placeholder='Digite seu e-mail...'
                            value={dataForm.email}
                            autoCapitalize='none'
                            onChangeText={handleInputChange('email')}
                        />
                    </View>
                    <View style={styles.inputsBox}>
                        <Text>Senha</Text>
                        <TextInput
                            style={{ backgroundColor: '#F0F0F0', borderWidth: 1 }}
                            placeholder='Digite sua senha...'
                            value={dataForm.senha}
                            autoCapitalize='none'
                            secureTextEntry
                            onChangeText={handleInputChange('senha')}
                        />
                    </View>
                    <TouchableOpacity onPress={handleSubmit}>
                        <View style={styles.loginBtn}>
                            <Text style={{ color: 'white' }}>Login</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}





// espaço para estilização de componentes...


const styles = StyleSheet.create({
    safeView: {
        backgroundColor: '#005613',
        flex: 1,
        padding: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainContainer: {
        height: '55%',
        width: '90%',
        backgroundColor: '#FFFFFF'
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 90

    },
    inputsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    },
    inputsBox: {
        width: '90%',
        gap: 10,

    },

    loginBtn: {
        backgroundColor: '#005613',
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },

    logoImg: {
        width: 50,
        height: 50,

    }
})

export default Login
