import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { NotificationBell } from "@/src/components/NotificationBell";
import { CardDestaque, CardNumero, Pilula } from "@/src/components/HomeCards";
import { IconEnviado, IconEstrela, IconMais, IconMapa, IconVagas } from "@/src/components/TabIcons";
import { useSession } from "@/src/lib/session";
import { minhasVagas } from "@/src/api/jobs";
import { buscarFeed, contarNoRaio } from "@/src/api/feed";
import { minhasCandidaturas } from "@/src/api/applications";
import { avaliacoesPendentes } from "@/src/api/ratings";
import { buscarPerfil } from "@/src/api/profile";
import { useEhDesktop } from "@/src/lib/layout";
import { colors, space, type } from "@/src/theme/tokens";

type Resumo = {
  /** Profissional: vagas no raio. Contratante: vagas abertas. */
  principal: number | null;
  /** Profissional: urgentes no raio. Contratante: candidatos esperando. */
  urgentes: number | null;
  /** Quantas candidaturas enviei / quantos candidatos recebi. */
  secundario: number | null;
  /** Trabalhos que já aconteceram: a métrica que constrói reputação. */
  realizados: number | null;
  pendentes: number;
  /** Raio configurado, para a descrição do cartão. */
  raioKm: number | null;
};

const VAZIO: Resumo = {
  principal: null,
  urgentes: null,
  secundario: null,
  realizados: null,
  pendentes: 0,
  raioKm: null
};

/** Início: o retrato do momento, por tipo de conta. */
export default function Home() {
  const { profile, session } = useSession();
  const router = useRouter();
  const ehContratante = profile?.tipo === "contratante";
  // No desktop o rail já mostra avatar, nome e tipo de conta: repetir a
  // saudação aqui era dizer a mesma coisa duas vezes, a dez centímetros de
  // distância. Lá a tela se identifica pelo título no header, como as
  // outras; no celular, sem rail, a saudação continua sendo a abertura.
  const desktop = useEhDesktop();
  const [r, setR] = useState<Resumo>(VAZIO);

  useFocusEffect(
    useCallback(() => {
      const id = session?.user.id;
      if (!id) return;
      let vivo = true;

      // Cada persona olha para um conjunto diferente de números, mas o
      // formato do resumo é o mesmo — é o que deixa a tela ter uma
      // estrutura só, com dois conteúdos.
      const agora = Date.now();

      async function carregaContratante(userId: string) {
        const vagas = await minhasVagas(userId);
        const abertas = vagas.filter((v) => v.status === "aberta");
        const candidatos = vagas.reduce((t, v) => t + (v.applications?.[0]?.count ?? 0), 0);
        return {
          principal: abertas.length,
          urgentes: abertas.filter((v) => v.is_urgent).length,
          secundario: candidatos,
          // Preenchida e com a data já passada: contratar não é a mesma
          // coisa que o trabalho ter acontecido.
          realizados: vagas.filter(
            (v) => v.status === "preenchida" && new Date(v.starts_at).getTime() < agora
          ).length,
          raioKm: null
        };
      }

      async function carregaProfissional(userId: string) {
        const perfil = await buscarPerfil(userId);
        const raio = perfil?.professional?.raio_km ?? 30;
        // Sem base definida não há raio que valha: o cartão vira convite
        // para configurar em vez de exibir um zero sem explicação.
        const temBase = !!perfil?.professional?.base_definida;

        const [noRaio, urgentes, candidaturas] = await Promise.all([
          temBase ? contarNoRaio(raio) : Promise.resolve(0),
          temBase ? buscarFeed({ apenasUrgentes: true }) : Promise.resolve([]),
          minhasCandidaturas(userId)
        ]);

        return {
          principal: temBase ? noRaio : -1,
          urgentes: urgentes.length,
          // Retirada não conta como tentativa: a pessoa desistiu.
          secundario: candidaturas.filter((c) => c.status !== "retirada").length,
          // Selecionado e com a data já passada — o job de fato aconteceu.
          realizados: candidaturas.filter(
            (c) =>
              c.status === "selecionada" &&
              !!c.jobs &&
              new Date(c.jobs.starts_at).getTime() < agora
          ).length,
          raioKm: temBase ? raio : null
        };
      }

      Promise.all([
        ehContratante ? carregaContratante(id) : carregaProfissional(id),
        avaliacoesPendentes().catch(() => [])
      ])
        .then(([base, pendentes]) => {
          if (!vivo) return;
          setR({ ...base, pendentes: pendentes.length });
        })
        .catch(() => {});

      return () => {
        vivo = false;
      };
    }, [session?.user.id, ehContratante])
  );

  const semBase = !ehContratante && r.principal === -1;
  const primeiroNome = (profile?.nome ?? "por aí").trim().split(" ")[0];

  return (
    <Screen
      logo={!desktop}
      titulo={desktop ? "Início" : undefined}
      right={<NotificationBell />}
    >
      {!desktop && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.title}>
            Olá,{"\n"}
            {primeiroNome}.
          </Text>
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInDown.delay(80).duration(500)}
        style={desktop ? styles.destaqueSozinho : styles.destaqueBloco}
      >
        {ehContratante ? (
          <CardDestaque
            eyebrow="SUAS VAGAS"
            valor={r.principal}
            unidade={r.principal === 1 ? "vaga aberta" : "vagas abertas"}
            descricao={
              r.principal === 0
                ? "Publique a primeira e avisamos quem está no raio na mesma hora."
                : "Acompanhe quem se candidatou e escolha na hora."
            }
            selo={r.urgentes ? `${r.urgentes} URGENTE${r.urgentes > 1 ? "S" : ""}` : null}
            cta="PUBLICAR VAGA"
            onPress={() => router.push("/(app)/vaga/nova")}
          />
        ) : semBase ? (
          <CardDestaque
            eyebrow="PRIMEIRO PASSO"
            valor={0}
            unidade="vagas no seu raio"
            descricao="Defina onde você atua para o feed encher e para receber aviso de vaga urgente na região."
            selo={null}
            cta="DEFINIR MINHA BASE"
            onPress={() => router.push("/(app)/perfil/localizacao")}
          />
        ) : (
          <CardDestaque
            eyebrow="PERTO DE VOCÊ"
            valor={r.principal}
            unidade={r.principal === 1 ? "vaga aberta" : "vagas abertas"}
            descricao={
              r.principal === 0
                ? `Nada dentro de ${r.raioKm} km agora. Deixe as notificações ligadas.`
                : `Dentro dos seus ${r.raioKm} km. Candidatar é um toque.`
            }
            selo={r.urgentes ? `${r.urgentes} URGENTE${r.urgentes > 1 ? "S" : ""}` : null}
            cta="VER O FEED"
            onPress={() => router.push("/(app)/(tabs)/vagas")}
          />
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.numeros}>
        <CardNumero
          valor={r.secundario}
          rotulo={ehContratante ? "candidatos recebidos" : "aplicados"}
          onPress={
            ehContratante
              ? () => router.push("/(app)/(tabs)/vagas")
              : () => router.push("/(app)/candidaturas")
          }
        />
        <CardNumero
          valor={r.realizados}
          rotulo="realizados"
          onPress={
            ehContratante
              ? () => router.push("/(app)/(tabs)/vagas")
              : () => router.push("/(app)/avaliacoes")
          }
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.pilulas}>
        {ehContratante ? (
          <Pilula
            icone={<IconVagas color={colors.magenta} size={20} />}
            label="Minhas vagas"
            onPress={() => router.push("/(app)/(tabs)/vagas")}
          />
        ) : (
          <Pilula
            icone={<IconEnviado color={colors.magenta} size={20} />}
            label="Minhas candidaturas"
            onPress={() => router.push("/(app)/candidaturas")}
          />
        )}

        <Pilula
          icone={<IconEstrela color={colors.magenta} size={20} />}
          label="Avaliações"
          detalhe={r.pendentes > 0 ? String(r.pendentes) : null}
          onPress={() => router.push("/(app)/avaliacoes")}
        />

        {ehContratante ? (
          <Pilula
            icone={<IconMais color={colors.magenta} size={20} />}
            label="Publicar uma vaga"
            onPress={() => router.push("/(app)/vaga/nova")}
          />
        ) : (
          <Pilula
            icone={<IconMapa color={colors.magenta} size={20} />}
            label="Onde eu atuo"
            onPress={() => router.push("/(app)/perfil/localizacao")}
          />
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.lg },
  title: { ...type.display, color: colors.white },

  destaqueBloco: { marginTop: space.xl },
  destaqueSozinho: { marginTop: space.md },
  numeros: { flexDirection: "row", gap: space.md, marginTop: space.md },
  pilulas: { gap: space.sm, marginTop: space.xl, paddingBottom: space.xl }
});
