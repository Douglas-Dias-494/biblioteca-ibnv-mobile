export type Solicitacao = {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  ano_publicacao: number;
  data_solicitacao_formatada: string;
  imagem_url?: string; // se houver imagem
  status: string;
//  usuario_email?: string;
};
