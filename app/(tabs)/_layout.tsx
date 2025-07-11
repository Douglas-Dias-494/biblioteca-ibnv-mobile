import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#005613', tabBarInactiveTintColor: 'gray' }}>
      <Tabs.Screen
       name="Home" 
       options={{ 
        title: 'Home',
        tabBarIcon: ({ color, size, focused }) => (
            <Entypo name={ focused ? 'home' : 'home' } color={color} size={size} />
        )
     }}
        
      />
      <Tabs.Screen 
      name="myBooks"
       options={{
         title: 'Meus Livros',
         tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={ focused ? 'my-library-books' : 'my-library-books' } color={color} size={size} />
         )
         }} 
      
      
      
      
      />
      <Tabs.Screen
       name="avalBooks"
        options={{
             title: 'Acervo',
             tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons name={ focused ? 'book-search' : 'book-search' } color={color} size={size} />
             )
              }} />
      <Tabs.Screen
       name="requests"
        options={{
             title: 'Solicitações',
             tabBarIcon: ({ color, size, focused }) => (
                <MaterialIcons name={ focused ? 'person-search' : 'person-search' } color={color} size={size} />
             )
              }} />
    </Tabs>
  );
}
