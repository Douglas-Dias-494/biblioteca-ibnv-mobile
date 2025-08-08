// app/admin/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="SolicitacoesAtivas"
        options={{
          title: 'Solicitações ativas',
        }}
      />

      <Tabs.Screen
        name="AvalBooks"
        options={{
          title: 'Acervo',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name={focused ? 'book-search' : 'book-search'} color={color} size={size} />
          )
        }} />

        <Tabs.Screen
        name="ActiveAccounts"
        options={{
        title: 'Contas Ativas',
        }} />
    </Tabs>

    
  );
}

