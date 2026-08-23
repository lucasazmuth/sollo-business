import { Tabs } from "expo-router";
import { TabBar } from "@/src/components/TabBar";

/** Casca de navegação principal do app: 4 abas, visual próprio (ver TabBar.tsx). */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="vagas" />
      <Tabs.Screen name="conversas" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
