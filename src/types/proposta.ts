export type UUID = string;

export type StatusProposta =
  | "pendente"
  | "respondida"
  | "aceita"
  | "rejeitada"
  | "cancelada";

export interface Proposta {
  id: UUID;
  produtoId: UUID;
  mensagem: string;
  status: StatusProposta;
  resposta?: string | null;
  dataResponsta?: string | null;
}

export interface CriarPropostaRequest {
  produtoId: UUID;
  usuarioId?: UUID;
  mensagem: string;
}

export type MinhasPropostasResponse = Proposta[];
