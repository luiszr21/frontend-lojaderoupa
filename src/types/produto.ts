export type UUID = string;

export interface Produto {
  id: UUID;
  nome: string;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
}

export type ListarProdutosResponse = Produto[];
export type DetalharProdutoResponse = Produto;