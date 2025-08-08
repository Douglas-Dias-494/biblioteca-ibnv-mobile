import { Stack, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import './global.css'

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const verificarToken = async () => {

      try {
        const token = await AsyncStorage.getItem('token')

        if (pathname === '/') { // 👈 só redireciona se estiver na raiz
          if (token) {
            router.replace('/(tabs)/Home');
          } else {
            router.replace('/Login');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verificarToken();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="books/descritiveBookPage" options={{ headerShown: false }} />
    </Stack>

  )
}
