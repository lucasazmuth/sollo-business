import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltam EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Veja mobile/.env.example."
  );
}

/**
 * O token de sessão vive no Keychain (iOS) / Keystore (Android), não em
 * AsyncStorage. O SecureStore tem limite de ~2 KB por valor no Android e
 * o JWT do Supabase passa disso, então o valor é fatiado em pedaços e
 * remontado na leitura.
 */
const CHUNK = 1800;

const secureStorage = {
  async getItem(key: string) {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;

    const partes = Number(head);
    if (!Number.isInteger(partes)) return head; // valor curto, gravado inteiro

    const pedacos = await Promise.all(
      Array.from({ length: partes }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`))
    );
    return pedacos.some((p) => p === null) ? null : pedacos.join("");
  },

  async setItem(key: string, value: string) {
    await limpaPedacos(key);

    if (value.length <= CHUNK) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const partes = Math.ceil(value.length / CHUNK);
    await Promise.all(
      Array.from({ length: partes }, (_, i) =>
        SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK))
      )
    );
    await SecureStore.setItemAsync(key, String(partes));
  },

  async removeItem(key: string) {
    await limpaPedacos(key);
    await SecureStore.deleteItemAsync(key);
  }
};

async function limpaPedacos(key: string) {
  const head = await SecureStore.getItemAsync(key).catch(() => null);
  const partes = Number(head);
  if (!Number.isInteger(partes)) return;
  await Promise.all(
    Array.from({ length: partes }, (_, i) => SecureStore.deleteItemAsync(`${key}.${i}`))
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Sem isso o RN tenta ler o token da URL, que não existe aqui.
    detectSessionInUrl: false
  }
});

/**
 * Renovar token em background gasta bateria à toa: o Supabase recomenda
 * ligar o refresh só enquanto o app está em primeiro plano.
 */
AppState.addEventListener("change", (estado) => {
  if (estado === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
