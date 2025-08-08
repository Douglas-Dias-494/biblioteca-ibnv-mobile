// app/admin/_layout.tsx
import React, { useEffect, useState, ReactNode } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Slot, useRouter } from 'expo-router';
import { HeaderShownContext } from '@react-navigation/elements';

type DecodedToken = {
  role: string;
};

export default function AdminLayout() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return setIsAuthorized(false);

        const decoded: DecodedToken = jwtDecode(token);
        setIsAuthorized(decoded.role === 'admin');
      } catch (e) {
        console.error(e);
        setIsAuthorized(false);
      }
    };

    checkAdminRole();
  }, []);

  useEffect(() => {
    if (isAuthorized === false) {
      router.replace('/Login');
    }
  }, [isAuthorized]);

  if (isAuthorized === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Verificando permissão de administrador...</Text>
      </View>
    );
  }

 return <Slot screenOptions={{ headerShown: false }} />; // mostra os filhos, como (tabs)/_layout.tsx
}
