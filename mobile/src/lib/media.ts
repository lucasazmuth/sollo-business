import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/src/lib/supabase";

export type Bucket = "avatars" | "portfolio" | "jobs";

export class MediaError extends Error {}

/**
 * Abre a galeria e devolve a imagem escolhida, já comprimida.
 * `null` significa que a pessoa cancelou — não é erro.
 */
export async function escolherImagem(opcoes?: {
  quadrada?: boolean;
}): Promise<ImagePicker.ImagePickerAsset | null> {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    throw new MediaError("Precisamos de acesso às suas fotos para continuar.");
  }

  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: opcoes?.quadrada ? [1, 1] : [4, 5],
    quality: 0.8,
    exif: false // metadado de EXIF carrega coordenada da foto; fora.
  });

  return r.canceled ? null : r.assets[0];
}

/**
 * Sobe a imagem para o Storage e devolve a URL pública.
 *
 * O caminho é sempre `{profile_id}/{arquivo}` porque a policy do bucket
 * usa a primeira pasta para saber quem é o dono.
 */
export async function enviarImagem(
  bucket: Bucket,
  asset: ImagePicker.ImagePickerAsset,
  profileId: string
): Promise<string> {
  const extensao = (asset.uri.split(".").pop() ?? "jpg").toLowerCase().split("?")[0];
  const tipo = asset.mimeType ?? `image/${extensao === "jpg" ? "jpeg" : extensao}`;
  const caminho = `${profileId}/${Date.now()}.${extensao}`;

  const arquivo = await fetch(asset.uri).then((r) => r.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, {
    contentType: tipo,
    upsert: false
  });

  if (error) throw new MediaError(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);
  return data.publicUrl;
}

/** Remove do Storage a partir da URL pública guardada no banco. */
export async function removerImagem(bucket: Bucket, publicUrl: string) {
  const marcador = `/${bucket}/`;
  const i = publicUrl.indexOf(marcador);
  if (i === -1) return;

  const caminho = publicUrl.slice(i + marcador.length).split("?")[0];
  await supabase.storage.from(bucket).remove([caminho]);
}
