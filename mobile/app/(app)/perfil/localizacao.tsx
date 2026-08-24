import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { avisar } from "@/src/lib/dialogo";
import { Button } from "@/src/components/Button";
import { useSession } from "@/src/lib/session";
import { buscarPerfil, salvarLocalizacao, salvarPerfilProfissional } from "@/src/api/profile";
import { colors, radius, space, type } from "@/src/theme/tokens";

const RAIOS = [10, 20, 30, 50, 100];

/**
 * A tela que liga o motor de notificação: sem ponto-base e raio, o
 * profissional não entra em nenhum fanout de vaga.
 */
export default function Localizacao() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;

  const [carregando, setCarregando] = useState(true);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [raio, setRaio] = useState(30);
  const [label, setLabel] = useState<string | null>(null);
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [jaDefinido, setJaDefinido] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let vivo = true;

    buscarPerfil(userId)
      .then((p) => {
        if (!vivo || !p?.professional) return;
        setRaio(p.professional.raio_km ?? 30);
        setLabel(p.professional.base_label);
        setJaDefinido(p.professional.base_definida);
      })
      .finally(() => vivo && setCarregando(false));

    return () => {
      vivo = false;
    };
  }, [userId]);

  async function usarGps() {
    setBuscandoGps(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        avisar(
          "Sem acesso à localização",
          "Sem isso não conseguimos avisar de vagas perto de você. Você pode liberar em Ajustes."
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      // Bairro/cidade só para exibir — a coordenada é o que importa.
      const [lugar] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }).catch(() => [null]);

      const texto = lugar
        ? [lugar.district ?? lugar.subregion, lugar.city ?? lugar.region]
            .filter(Boolean)
            .join(", ")
        : "Localização definida";

      setCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLabel(texto);
    } catch {
      avisar("Não deu", "Não conseguimos obter sua localização agora.");
    } finally {
      setBuscandoGps(false);
    }
  }

  async function salvar() {
    if (!userId) return;
    setSalvando(true);
    try {
      if (coord) {
        await salvarLocalizacao({ lat: coord.lat, lng: coord.lng, label: label ?? undefined, raioKm: raio });
      } else {
        await salvarPerfilProfissional(userId, { raio_km: raio });
      }
      router.back();
    } catch (e) {
      avisar("Não deu", e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  const temLocal = !!coord || jaDefinido;

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>ONDE EU ATUO
        </Text>
        <Text style={styles.titulo}>Até onde{"\n"}você topa ir?</Text>
        <Text style={styles.lead}>
          É esse raio que decide quais vagas chegam até você. Nada fora dele te notifica.
        </Text>
      </View>

      <Pressable style={[styles.cardLocal, temLocal && styles.cardLocalOk]} onPress={usarGps}>
        <View style={styles.localTexto}>
          <Text style={styles.localRotulo}>SUA BASE</Text>
          <Text style={styles.localValor}>
            {buscandoGps ? "Localizando…" : label ?? "Toque para usar sua localização"}
          </Text>
        </View>
        {buscandoGps ? (
          <ActivityIndicator color={colors.magenta} size="small" />
        ) : (
          <Text style={styles.localAcao}>{temLocal ? "ATUALIZAR" : "USAR GPS"}</Text>
        )}
      </Pressable>

      <Text style={styles.privacidade}>
        Guardamos sua base com precisão de bairro, nunca o endereço exato.
      </Text>

      <View style={styles.secaoRaio}>
        <Text style={styles.rotulo}>RAIO DE ATUAÇÃO</Text>

        <Animated.Text key={raio} entering={FadeIn.duration(260)} style={styles.raioValor}>
          {raio} km
        </Animated.Text>

        <View style={styles.opcoes}>
          {RAIOS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRaio(r)}
              style={[styles.opcao, r === raio && styles.opcaoAtiva]}
            >
              <Text style={[styles.opcaoTexto, r === raio && styles.opcaoTextoAtivo]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.ajuda}>
          {raio <= 10
            ? "Bem restrito. Você vê menos vagas, mas todas do seu lado."
            : raio >= 100
              ? "Bem amplo. Espere vagas que exigem deslocamento longo."
              : "Faixa mais comum para quem atende a região metropolitana."}
        </Text>
      </View>

      <View style={styles.rodape}>
        <Button label="Salvar" onPress={salvar} loading={salvando} />
        {!temLocal && (
          <Text style={styles.aviso}>
            Sem definir sua base, você não entra nas notificações de vaga.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabecalho: { gap: space.md, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },

  cardLocal: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardLocalOk: { borderColor: colors.lime },
  localTexto: { flex: 1, gap: 4 },
  localRotulo: { ...type.label, color: colors.inkFaint },
  localValor: { ...type.bodyMedium, color: colors.white },
  localAcao: { ...type.label, color: colors.magenta },
  privacidade: { ...type.caption, color: colors.inkFaint, marginTop: space.sm },

  secaoRaio: { marginTop: space["2xl"], gap: space.md },
  rotulo: { ...type.label, color: colors.inkDim },
  raioValor: { ...type.display, color: colors.magenta },
  opcoes: { flexDirection: "row", gap: space.sm },
  opcao: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  opcaoAtiva: { borderColor: colors.magenta, backgroundColor: "rgba(216,19,104,0.12)" },
  opcaoTexto: { ...type.bodyMedium, color: colors.inkDim },
  opcaoTextoAtivo: { color: colors.white },
  ajuda: { ...type.caption, color: colors.inkFaint },

  rodape: { marginTop: "auto", paddingTop: space["2xl"], gap: space.md, paddingBottom: space.sm },
  aviso: { ...type.caption, color: colors.inkFaint, textAlign: "center" }
});
