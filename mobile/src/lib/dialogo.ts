import { Alert, Platform } from "react-native";

/**
 * Avisos e confirmações que funcionam também no navegador.
 *
 * O `Alert` do react-native-web é literalmente `static alert() {}` — um
 * no-op. Não quebra nada, e é justamente esse o problema: em
 * app.sollo.business o "Excluir conta", o "Escolher candidato" e o
 * "Remover do portfólio" abriam um diálogo que nunca aparecia, então o
 * botão simplesmente não fazia nada e não havia erro para investigar.
 *
 * `window.confirm` e `window.alert` são feios, mas são a única primitiva
 * de diálogo bloqueante que existe no navegador sem construir um modal
 * próprio. Quando houver um modal de confirmação da marca, é só trocar o
 * corpo destas duas funções.
 */

export function avisar(titulo: string, mensagem?: string) {
  if (Platform.OS === "web") {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }
  Alert.alert(titulo, mensagem);
}

type OpcoesConfirmacao = {
  titulo: string;
  mensagem?: string;
  /** Rótulo do botão que confirma. */
  confirmar: string;
  cancelar?: string;
  /** Pinta o botão de vermelho no iOS. */
  destrutivo?: boolean;
};

/** Resolve `true` se a pessoa confirmou. Nunca rejeita. */
export function confirmar(o: OpcoesConfirmacao): Promise<boolean> {
  if (Platform.OS === "web") {
    const texto = o.mensagem ? `${o.titulo}\n\n${o.mensagem}` : o.titulo;
    return Promise.resolve(window.confirm(texto));
  }

  return new Promise((resolve) => {
    Alert.alert(o.titulo, o.mensagem, [
      { text: o.cancelar ?? "Cancelar", style: "cancel", onPress: () => resolve(false) },
      {
        text: o.confirmar,
        style: o.destrutivo ? "destructive" : "default",
        onPress: () => resolve(true)
      }
    ]);
  });
}
