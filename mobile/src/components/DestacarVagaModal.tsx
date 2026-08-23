import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/src/components/Button";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Props = {
  visivel: boolean;
  onFechar: () => void;
};

/**
 * "Destacar vaga" — a única cobrança do MVP (R$ 7,90 via PIX/Asaas, 7 dias no
 * topo do feed). O Asaas ainda não está integrado: este modal só explica a
 * oferta e avisa "em breve" — não chama nenhuma API de pagamento nem grava
 * nada no banco.
 */
export function DestacarVagaModal({ visivel, onFechar }: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.eyebrow}>DESTACAR VAGA</Text>
          <Text style={styles.preco}>
            R$ 7,90 <Text style={styles.precoSufixo}>/ 7 dias no topo</Text>
          </Text>
          <Text style={styles.texto}>
            Sua vaga aparece antes de todas as outras no feed de quem está no raio, por 7 dias
            corridos. Pagamento único via PIX, processado pelo Asaas.
          </Text>

          <View style={styles.avisoEmBreve}>
            <View style={styles.pontoAviso} />
            <Text style={styles.avisoTexto}>
              Em breve — ainda não processamos pagamento dentro do app. Quando isso ativar, você
              recebe um aviso.
            </Text>
          </View>

          <Button label="Entendi" variant="ghost" onPress={onFechar} style={{ marginTop: space.lg }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: space.xl
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    gap: space.sm
  },
  eyebrow: { ...type.label, color: colors.magenta },
  preco: { ...type.h1, color: colors.white, marginTop: space.xs },
  precoSufixo: { ...type.body, color: colors.inkDim },
  texto: { ...type.body, color: colors.inkDim, marginTop: space.sm },

  avisoEmBreve: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2
  },
  pontoAviso: { width: 7, height: 7, borderRadius: 4, marginTop: 6, backgroundColor: colors.lime },
  avisoTexto: { ...type.caption, color: colors.inkDim, flex: 1 }
});
