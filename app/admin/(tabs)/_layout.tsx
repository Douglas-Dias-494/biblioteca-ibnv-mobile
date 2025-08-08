// app/admin/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
    </Tabs>
  );
}

