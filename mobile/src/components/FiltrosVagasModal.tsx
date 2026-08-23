import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "@/src/components/Chip";
import { Button } from "@/src/components/Button";
import type { Category } from "@/src/api/profile";
import { colors, radius, space, type } from "@/src/theme/tokens";

const RAIOS = [10, 20, 30, 50, 100];

type Props = {
  visivel: boolean;
  onFechar: () => void;
  categorias: Category[];
  /** null = usa o raio do perfil ("meu raio"). */
  raio: number | null;
  aoMudarRaio: (v: number | null) => void;
  categoriaFiltro: string | null;
  aoMudarCategoria: (v: string | null) => void;
  apenasUrgentes: boolean;
  aoMudarUrgentes: (v: boolean) => void;
  /** Quantas vagas o filtro atual devolve, para o botão de fechar. */
  totalVagas: number;
};

/**
 * Filtros do feed em folha que sobe.
 *
 * Antes era um painel embutido no cabeçalho fixo: as duas dezenas de
 * categorias dividiam a tela ao meio com o feed e não sobrava altura
 * decente para nenhum dos dois. Filtro é uma decisão de momento, não um
 * pedaço permanente da tela — sobe, escolhe, sai.
 *
 * As mudanças valem na hora (o feed atrás recarrega), então o botão do
 * rodapé só fecha, mostrando quantas vagas sobraram.
 */
export function FiltrosVagasModal({
  visivel,
  onFechar,
  categorias,
  raio,
  aoMudarRaio,
  categoriaFiltro,
  aoMudarCategoria,
  apenasUrgentes,
  aoMudarUrgentes,
  totalVagas
}: Props) {
  const insets = useSafeAreaInsets();
  const ativos = (raio !== null ? 1 : 0) + (categoriaFiltro ? 1 : 0) + (apenasUrgentes ? 1 : 0);

  function limpar() {
    aoMudarRaio(null);
    aoMudarCategoria(null);
    aoMudarUrgentes(false);
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      {/* O fundo fecha ao toque; a folha para o toque para não fechar
          quando a pessoa escolhe um chip. */}
      <Pressable style={styles.fundo} onPress={onFechar}>
        <Pressable style={styles.folha} onPress={(e) => e.stopPropagation()}>
          <View style={styles.puxador} />

          <View style={styles.topo}>
            <Text style={styles.titulo}>Filtros</Text>
            {ativos > 0 && (
              <Pressable onPress={limpar} hitSlop={12}>
                <Text style={styles.limpar}>LIMPAR</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            style={styles.corpo}
            contentContainerStyle={styles.corpoConteudo}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.rotulo}>RAIO</Text>
            <View style={styles.linha}>
              <Chip label="Meu raio" selecionado={raio === null} onPress={() => aoMudarRaio(null)} />
              {RAIOS.map((r) => (
                <Chip
                  key={r}
                  label={`${r} km`}
                  selecionado={raio === r}
                  onPress={() => aoMudarRaio(r)}
                />
              ))}
            </View>

            <Text style={styles.rotulo}>CATEGORIA</Text>
            <View style={styles.linha}>
              <Chip
                label="Minhas"
                selecionado={categoriaFiltro === null}
                onPress={() => aoMudarCategoria(null)}
              />
              {categorias.map((c) => (
                <Chip
                  key={c.id}
                  label={c.nome}
                  selecionado={categoriaFiltro === c.id}
                  onPress={() => aoMudarCategoria(categoriaFiltro === c.id ? null : c.id)}
                />
              ))}
            </View>

            <Text style={styles.rotulo}>URGÊNCIA</Text>
            <View style={styles.linha}>
              <Chip
                label="Só urgentes"
                tom="lime"
                selecionado={apenasUrgentes}
                onPress={() => aoMudarUrgentes(!apenasUrgentes)}
              />
            </View>
          </ScrollView>

          <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
            <Button
              label={
                totalVagas === 0
                  ? "Nenhuma vaga com esses filtros"
                  : `Ver ${totalVagas} vaga${totalVagas > 1 ? "s" : ""}`
              }
              onPress={onFechar}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  folha: {
    // Teto de altura para o fundo continuar visível: a folha precisa parecer
    // que está por cima do feed, não que virou outra tela.
    maxHeight: "82%",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg
  },
  puxador: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    alignSelf: "center",
    marginTop: space.md
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.md
  },
  titulo: { ...type.h2, color: colors.white },
  limpar: { ...type.label, color: colors.magenta },

  corpo: { flexGrow: 0 },
  corpoConteudo: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.sm },
  rotulo: { ...type.label, fontSize: 9, color: colors.inkFaint, marginTop: space.lg },
  linha: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },

  rodape: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line
  }
});
