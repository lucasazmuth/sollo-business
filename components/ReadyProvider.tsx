"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type ReadyContextValue = {
  /** true depois que o preloader termina — libera a animação de entrada do hero. */
  ready: boolean;
  /** O preloader avisa que assumiu o controle da abertura. */
  claim: () => void;
  markReady: () => void;
};

const ReadyContext = createContext<ReadyContextValue>({
  ready: true,
  claim: () => {},
  markReady: () => {}
});

export function ReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const claimed = useRef(false);

  const claim = useCallback(() => {
    claimed.current = true;
  }, []);
  const markReady = useCallback(() => setReady(true), []);

  /* Efeitos dos filhos rodam antes do efeito do pai: se nenhum preloader
     se anunciou, a página libera a entrada imediatamente. */
  useEffect(() => {
    if (!claimed.current) setReady(true);
  }, []);

  /* Rede de segurança: nada fica escondido se o preloader falhar. */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const value = useMemo(() => ({ ready, claim, markReady }), [ready, claim, markReady]);

  return <ReadyContext.Provider value={value}>{children}</ReadyContext.Provider>;
}

export const useReady = () => useContext(ReadyContext);
