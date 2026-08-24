import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "@/src/lib/supabase";

/**
 * Push via Expo Notifications (que usa FCM no Android e APNs no iOS).
 *
 * ⚠️ O Expo Go não recebe push remoto desde o SDK 53 — é preciso um
 * development build. Aqui isso é detectado e reportado, em vez de
 * falhar silenciosamente e parecer que o registro deu certo.
 */

/**
 * O módulo nativo não existe no navegador: chamar qualquer coisa dele lá
 * derruba a tela com "not available on web". O app roda também em
 * app.sollo.business, então toda entrada daqui precisa passar por esta
 * porta antes de tocar no `Notifications`.
 */
export const PUSH_SUPORTADO = Platform.OS !== "web";

if (PUSH_SUPORTADO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true
    })
  });
}

export type ResultadoRegistro =
  | { ok: true; token: string }
  | {
      ok: false;
      motivo: "web" | "expo-go" | "simulador" | "permissao-negada" | "erro";
      detalhe?: string;
    };

export async function registrarParaPush(profileId: string): Promise<ResultadoRegistro> {
  if (!PUSH_SUPORTADO) {
    return { ok: false, motivo: "web" };
  }
  if (Constants.appOwnership === "expo") {
    return { ok: false, motivo: "expo-go" };
  }
  if (!Device.isDevice) {
    return { ok: false, motivo: "simulador" };
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Vagas e mensagens",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#D81368"
      });
    }

    const atual = await Notifications.getPermissionsAsync();
    let status = atual.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return { ok: false, motivo: "permissao-negada" };

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    // upsert pelo token: o mesmo aparelho não vira duas linhas.
    const { error } = await supabase.from("device_tokens").upsert(
      {
        profile_id: profileId,
        expo_token: token,
        platform: Platform.OS === "ios" ? "ios" : "android"
      },
      { onConflict: "expo_token" }
    );

    if (error) return { ok: false, motivo: "erro", detalhe: error.message };
    return { ok: true, token };
  } catch (e) {
    return { ok: false, motivo: "erro", detalhe: e instanceof Error ? e.message : String(e) };
  }
}

/** Some com o token deste aparelho — chamado no logout. */
export async function desregistrarPush() {
  try {
    if (!PUSH_SUPORTADO || Constants.appOwnership === "expo" || !Device.isDevice) return;
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await supabase.from("device_tokens").delete().eq("expo_token", token);
  } catch {
    // Sem token para remover: nada a fazer.
  }
}

/** Rota guardada no payload da notificação (`data.rota`). */
export function rotaDaNotificacao(resposta: Notifications.NotificationResponse): string | null {
  const data = resposta.notification.request.content.data as { rota?: string } | undefined;
  return data?.rota ?? null;
}
