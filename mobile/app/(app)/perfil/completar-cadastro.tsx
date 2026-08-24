import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { avisar } from "@/src/lib/dialogo";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useSession } from "@/src/lib/session";
import { salvarDadosPessoais } from "@/src/api/profile";
import { cpfValido, formatarCpf, formatarCep, apenasDigitos } from "@/src/lib/cpf";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

/**
 * Trava antes de publicar vaga: nome completo, CPF válido, telefone e
 * endereço. E-mail verificado é checado antes de chegar aqui (ver
 * vaga/nova.tsx) — essa tela só cobre os dados cadastrais.
 */
export default function CompletarCadastro() {
  const router = useRouter();
  const { session, refreshProfile } = useSession();
  const userId = session?.user.id;

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [end, setEnd] = useState<Endereco>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: ""
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  async function buscarCep() {
    const digitos = apenasDigitos(end.cep);
    if (digitos.length !== 8) {
      setErros((e) => ({ ...e, cep: "CEP precisa ter 8 dígitos." }));
      return;
    }
    setBuscandoCep(true);
    setErros((e) => ({ ...e, cep: "" }));
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const json = await res.json();
      if (json.erro || !json.cep) {
        setErros((e) => ({ ...e, cep: "CEP não encontrado." }));
        return;
      }
      setEnd((v) => ({
        ...v,
        logradouro: json.logradouro || v.logradouro,
        bairro: json.bairro || v.bairro,
        cidade: json.localidade || v.cidade,
        uf: json.uf || v.uf
      }));
    } catch {
      setErros((e) => ({ ...e, cep: "Falha ao buscar o CEP agora." }));
    } finally {
      setBuscandoCep(false);
    }
  }

  function validar() {
    const e: Record<string, string> = {};
    if (nomeCompleto.trim().split(" ").filter(Boolean).length < 2) {
      e.nomeCompleto = "Digite nome e sobrenome.";
    }
    if (!cpfValido(cpf)) e.cpf = "CPF inválido.";
    if (apenasDigitos(telefone).length < 10) e.telefone = "Telefone incompleto.";
    if (apenasDigitos(end.cep).length !== 8) e.cep = "CEP inválido.";
    if (!end.logradouro.trim()) e.logradouro = "Informe a rua.";
    if (!end.numero.trim()) e.numero = "Informe o número.";
    if (!end.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!end.cidade.trim() || !end.uf.trim()) e.cidade = "Confirme cidade e UF pelo CEP.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function salvar() {
    if (!userId || !validar()) return;
    setSalvando(true);
    try {
      // Tudo aqui é dado pessoal e vai para `dados_pessoais` (RLS de dono).
      // Não pode voltar para `profiles`/`hirer_profiles`: são vitrines com
      // SELECT liberado, e foi exatamente assim que o CPF vazou antes.
      await salvarDadosPessoais(userId, {
        telefone: apenasDigitos(telefone),
        nome_completo: nomeCompleto.trim(),
        cpf: apenasDigitos(cpf),
        cep: apenasDigitos(end.cep),
        logradouro: end.logradouro.trim(),
        numero: end.numero.trim(),
        complemento: end.complemento.trim() || null,
        bairro: end.bairro.trim(),
        cidade: end.cidade.trim(),
        uf: end.uf.trim().toUpperCase()
      });
      await refreshProfile();
      router.back();
    } catch (e) {
      avisar("Não deu", e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen back titulo="Complete seu cadastro">
      <View style={styles.header}>
        <Text style={styles.lead}>
          Precisamos desses dados uma vez só, antes da primeira vaga.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nome completo"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
          placeholder="Como está no seu documento"
          autoCapitalize="words"
          error={erros.nomeCompleto}
        />

        <Input
          label="CPF"
          value={cpf}
          onChangeText={(t) => setCpf(formatarCpf(t))}
          placeholder="000.000.000-00"
          keyboardType="number-pad"
          maxLength={14}
          error={erros.cpf}
        />

        <Input
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(21) 99999-9999"
          keyboardType="phone-pad"
          error={erros.telefone}
        />

        <View style={styles.secao}>
          <Text style={styles.label}>ENDEREÇO</Text>

          <View style={[styles.cepLinha, !!erros.cep && styles.cepLinhaErro]}>
            <Input
              label="CEP"
              value={end.cep}
              onChangeText={(t) => setEnd((v) => ({ ...v, cep: formatarCep(t) }))}
              placeholder="00000-000"
              keyboardType="number-pad"
              maxLength={9}
              containerStyle={styles.cepCampo}
            />
            <Pressable onPress={buscarCep} hitSlop={10} style={styles.buscarBotao}>
              {buscandoCep ? (
                <ActivityIndicator color={colors.magenta} size="small" />
              ) : (
                <Text style={styles.buscarTexto}>BUSCAR</Text>
              )}
            </Pressable>
          </View>
          {!!erros.cep && <Text style={styles.erro}>{erros.cep}</Text>}

          <Input
            label="Rua"
            value={end.logradouro}
            onChangeText={(t) => setEnd((v) => ({ ...v, logradouro: t }))}
            error={erros.logradouro}
          />

          <View style={styles.duasColunas}>
            <Input
              label="Número"
              value={end.numero}
              onChangeText={(t) => setEnd((v) => ({ ...v, numero: t }))}
              keyboardType="number-pad"
              containerStyle={styles.colunaMenor}
              error={erros.numero}
            />
            <Input
              label="Complemento"
              value={end.complemento}
              onChangeText={(t) => setEnd((v) => ({ ...v, complemento: t }))}
              placeholder="Opcional"
              containerStyle={styles.colunaMaior}
            />
          </View>

          <Input
            label="Bairro"
            value={end.bairro}
            onChangeText={(t) => setEnd((v) => ({ ...v, bairro: t }))}
            error={erros.bairro}
          />

          <View style={styles.duasColunas}>
            <Input
              label="Cidade"
              value={end.cidade}
              onChangeText={(t) => setEnd((v) => ({ ...v, cidade: t }))}
              containerStyle={styles.colunaMaior}
              error={erros.cidade}
            />
            <Input
              label="UF"
              value={end.uf}
              onChangeText={(t) => setEnd((v) => ({ ...v, uf: t.toUpperCase().slice(0, 2) }))}
              maxLength={2}
              autoCapitalize="characters"
              containerStyle={styles.colunaUf}
            />
          </View>
        </View>
      </View>

      <View style={styles.rodape}>
        <Button label="Salvar e continuar" onPress={salvar} loading={salvando} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.lg, paddingBottom: space.xl },
  lead: { ...type.body, color: colors.inkDim },

  form: { gap: space.lg },
  secao: { gap: space.lg, marginTop: space.md },
  label: { ...type.label, color: colors.inkDim },
  erro: { ...type.caption, color: colors.danger },

  cepLinha: { flexDirection: "row", alignItems: "flex-end", gap: space.md },
  cepLinhaErro: {},
  // O CEP tem tamanho fixo (8 dígitos): largura fixa deixa o campo com folga
  // real para digitar e sobra espaço para o "BUSCAR" ao lado.
  cepCampo: { width: 170 },
  buscarBotao: { height: 56, justifyContent: "center", paddingHorizontal: space.sm },
  buscarTexto: { ...type.label, color: colors.magenta },

  duasColunas: { flexDirection: "row", gap: space.md },
  colunaMaior: { flex: 2 },
  colunaMenor: { flex: 1 },
  colunaUf: { width: 76 },

  rodape: { marginTop: space["2xl"], paddingBottom: space.lg }
});
