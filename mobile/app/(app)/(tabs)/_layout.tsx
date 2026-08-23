import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { TabBar } from "@/src/components/TabBar";
import { SideRail } from "@/src/components/SideRail";
import { useEhDesktop } from "@/src/lib/layout";
import { colors } from "@/src/theme/tokens";

/**
 * Casca de navegação principal: 4 abas.
 *
 * No celular, tab bar embaixo (ver TabBar.tsx). Em tela larga — o app roda
 * também em app.sollo.business — ela some e a navegação vai para um rail
 * fixo à esquerda: quatro abas coladas no rodapé de um monitor de 1440px
 * ficam longe de tudo e desperdiçam a largura inteira.
 *
 * O rail vive FORA do `<Tabs>`, como irmão, e navega por rota. Assim ele
 * não depende dos props de tab bar do react-navigation e continua valendo
 * para telas que não são aba.
 */
export default function TabsLayout() {
  const desktop = useEhDesktop();

  return (
    <View style={styles.raiz}>
      {desktop && <SideRail />}

      <View style={styles.conteudo}>
        <Tabs
          tabBar={(props) => (desktop ? null : <TabBar {...props} />)}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="vagas" />
          <Tabs.Screen name="conversas" />
          <Tabs.Screen name="perfil" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, flexDirection: "row", backgroundColor: colors.bg },
  conteudo: { flex: 1 }
});
