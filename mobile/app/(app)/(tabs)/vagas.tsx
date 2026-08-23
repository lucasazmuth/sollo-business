import { useSession } from "@/src/lib/session";
import { FeedProfissional } from "@/src/screens/FeedProfissional";
import { MinhasVagasContratante } from "@/src/screens/MinhasVagasContratante";

/** Aba "Vagas": feed por raio para profissional, gestão de vagas para contratante. */
export default function VagasTab() {
  const { profile } = useSession();
  return profile?.tipo === "contratante" ? <MinhasVagasContratante /> : <FeedProfissional />;
}
