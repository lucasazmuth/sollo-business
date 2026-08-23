import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors, radius, space, type } from "@/src/theme/tokens";

export type LocalResolvido = {
  lat: number;
  lng: number;
  endereco: string;
  cidade: string | null;
  uf: string | null;
};

type Props = {
  valor: LocalResolvido | null;
  onChange: (local: LocalResolvido | null) => void;
  erro?: string;
};

/**
 * Endereço da vaga → coordenada.
 *
 * Usa o geocoder NATIVO do iOS/Android (expo-location), que é gratuito e
 * não exige chave. Sem dropdown de autocomplete, mas resolve o ponto — e
 * é o ponto que o motor de raio precisa. Trocar por Google Places depois
 * é substituir só este componente.
 *
 * Diferente da base do profissional, a coordenada da vaga NÃO é arredondada:
 * é endereço de trabalho, e o candidato precisa saber exatamente onde é.
 */
export function EnderecoInput({ valor, onChange, erro }: Props) {
  const [texto, setTexto] = useState(valor?.endereco ?? "");
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function buscarPorTexto() {
    const consulta = texto.trim();
    if (consulta.length < 5) {
      setAviso("Escreva o endereço com rua, número e cidade.");
      return;
    }

    setBuscando(true);
    setAviso(null);
    try {
      const [ponto] = await Location.geocodeAsync(consulta);
      if (!ponto) {
        setAviso("Não encontramos esse endereço. Tente incluir a cidade.");
        onChange(null);
        return;
      }

      const [lugar] = await Location.reverseGeocodeAsync({
        latitude: ponto.latitude,
        longitude: ponto.longitude
      }).catch(() => [null]);

      onChange({
        lat: ponto.latitude,
        lng: ponto.longitude,
        endereco: consulta,
        cidade: lugar?.city ?? lugar?.subregion ?? null,
        uf: normalizaUf(lugar?.region)
      });
    } catch {
      setAviso("Falha ao buscar o endereço agora.");
    } finally {
      setBuscando(false);
    }
  }

  async function usarLocalAtual() {
    setBuscando(true);
    setAviso(null);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setAviso("Sem acesso à localização. Digite o endereço.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [lugar] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }).catch(() => [null]);

      const endereco = lugar
        ? [lugar.street, lugar.streetNumber, lugar.district, lugar.city]
            .filter(Boolean)
            .join(", ")
        : "Local atual";

      setTexto(endereco);
      onChange({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        endereco,
        cidade: lugar?.city ?? lugar?.subregion ?? null,
        uf: normalizaUf(lugar?.region)
      });
    } catch {
      setAviso("Não conseguimos obter sua localização.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>ONDE É O TRABALHO</Text>

      <View style={[styles.campo, !!valor && styles.campoOk, !!erro && styles.campoErro]}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={(t) => {
            setTexto(t);
            if (valor) onChange(null); // texto mudou: a coordenada anterior não vale mais
          }}
          placeholder="Rua, número, bairro, cidade"
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.magenta}
          returnKeyType="search"
          onSubmitEditing={buscarPorTexto}
        />

        {buscando ? (
          <ActivityIndicator color={colors.magenta} size="small" />
        ) : (
          <Pressable onPress={buscarPorTexto} hitSlop={10}>
            <Text style={styles.acao}>BUSCAR</Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={usarLocalAtual} hitSlop={8}>
        <Text style={styles.atalho}>Usar minha localização atual</Text>
      </Pressable>

      {!!valor && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.confirmado}>
          <View style={styles.pontoOk} />
          <Text style={styles.confirmadoTexto}>
            Local confirmado{valor.cidade ? ` · ${valor.cidade}` : ""}
            {valor.uf ? `/${valor.uf}` : ""}
          </Text>
        </Animated.View>
      )}

      {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

/** O reverse geocode devolve "Rio de Janeiro" ou "RJ" conforme a plataforma. */
function normalizaUf(region?: string | null): string | null {
  if (!region) return null;
  if (region.length === 2) return region.toUpperCase();

  const mapa: Record<string, string> = {
    acre: "AC", alagoas: "AL", amapá: "AP", amazonas: "AM", bahia: "BA", ceará: "CE",
    "distrito federal": "DF", "espírito santo": "ES", goiás: "GO", maranhão: "MA",
    "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG", pará: "PA",
    paraíba: "PB", paraná: "PR", pernambuco: "PE", piauí: "PI", "rio de janeiro": "RJ",
    "rio grande do norte": "RN", "rio grande do sul": "RS", rondônia: "RO", roraima: "RR",
    "santa catarina": "SC", "são paulo": "SP", sergipe: "SE", tocantins: "TO"
  };
  return mapa[region.toLowerCase()] ?? null;
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { ...type.label, color: colors.inkDim },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  campoOk: { borderColor: colors.lime },
  campoErro: { borderColor: colors.danger },
  input: { flex: 1, ...type.bodyMedium, color: colors.ink, paddingVertical: space.md },
  acao: { ...type.label, color: colors.magenta },
  atalho: { ...type.caption, color: colors.magenta, fontFamily: type.h3.fontFamily },
  confirmado: { flexDirection: "row", alignItems: "center", gap: space.sm },
  pontoOk: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.lime },
  confirmadoTexto: { ...type.caption, color: colors.lime },
  aviso: { ...type.caption, color: colors.inkFaint },
  erro: { ...type.caption, color: colors.danger }
});
