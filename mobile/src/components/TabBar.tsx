import { Pressable, StyleSheet, Text, View } from "react-native";
// expo-router empacota sua própria cópia de @react-navigation/bottom-tabs;
// importar o pacote público causa incompatibilidade de tipos com o Tabs do expo-router.
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { IconConversas, IconInicio, IconPerfil, IconVagas } from "@/src/components/TabIcons";
import { colors, space, type } from "@/src/theme/tokens";

const ICONES: Record<string, (props: { color: string }) => React.ReactElement> = {
  home: IconInicio,
  vagas: IconVagas,
  conversas: IconConversas,
  perfil: IconPerfil
};

const ROTULOS: Record<string, string> = {
  home: "Início",
  vagas: "Vagas",
  conversas: "Conversas",
  perfil: "Perfil"
};

/** Tab bar própria, no visual da marca — não usa o estilo nativo do react-navigation. */
export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icone = ICONES[route.name];
        if (!Icone) return null;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={ROTULOS[route.name] ?? route.name}
            onPress={() => {
              const evento = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !evento.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}
            hitSlop={8}
          >
            <Icone color={focused ? colors.magenta : colors.inkFaint} />
            <Text style={[styles.rotulo, focused && styles.rotuloAtivo]}>
              {ROTULOS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
    paddingTop: space.sm
  },
  item: { flex: 1, alignItems: "center", gap: 4 },
  rotulo: { ...type.label, fontSize: 9, color: colors.inkFaint },
  rotuloAtivo: { color: colors.magenta }
});
