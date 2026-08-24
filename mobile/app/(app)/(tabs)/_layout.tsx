import { Tabs } from "expo-router";
import { TabBar } from "@/src/components/TabBar";
import { useEhDesktop } from "@/src/lib/layout";

/**
 * Casca de navegação principal: 4 abas.
 *
 * No celular, tab bar embaixo (ver TabBar.tsx). Em desktop ela some — a
 * navegação vive no rail lateral, montado em `(app)/_layout` para persistir
 * também nas telas empurradas.
 */
export default function TabsLayout() {
  const desktop = useEhDesktop();

  return (
    <Tabs
      tabBar={(props) => (desktop ? null : <TabBar {...props} />)}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="vagas" />
      <Tabs.Screen name="conversas" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
