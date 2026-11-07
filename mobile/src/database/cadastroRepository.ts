import * as Crypto from "expo-crypto";
import { db } from "./database";

export type Usuario = { id: string; nome: string; email: string | null; telefone: string | null; criado_em: string };
export type Propriedade = { id: string; usuario_id: string; localizacao_id: string | null; nome: string; codigo_estabelecimento: string | null; criado_em: string; municipio: string | null; uf: string | null };

export function obterUsuario(): Usuario | null {
  return db.getFirstSync<Usuario>("SELECT * FROM usuarios ORDER BY criado_em LIMIT 1");
}

export function salvarUsuario(nome: string, email: string, telefone: string): void {
  const atual = obterUsuario();
  if (atual) {
    db.runSync("UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id = ?", [nome.trim(), email.trim() || null, telefone.trim() || null, atual.id]);
  } else {
    db.runSync("INSERT INTO usuarios (id, nome, email, telefone, criado_em) VALUES (?, ?, ?, ?, ?)", [Crypto.randomUUID(), nome.trim(), email.trim() || null, telefone.trim() || null, new Date().toISOString()]);
  }
}

export function listarPropriedades(): Propriedade[] {
  return db.getAllSync<Propriedade>(`SELECT p.*, l.municipio, l.uf FROM propriedades p LEFT JOIN localizacoes l ON l.id = p.localizacao_id ORDER BY p.criado_em DESC`);
}

export function cadastrarPropriedade(nome: string, municipio: string, uf: string, endereco: string, codigo: string): void {
  const usuario = obterUsuario();
  if (!usuario) throw new Error("Cadastre seu perfil antes de cadastrar uma propriedade.");
  const localizacaoId = Crypto.randomUUID();
  const propriedadeId = Crypto.randomUUID();
  db.withTransactionSync(() => {
    db.runSync("INSERT INTO localizacoes (id, endereco, municipio, uf) VALUES (?, ?, ?, ?)", [localizacaoId, endereco.trim() || null, municipio.trim(), uf.trim().toUpperCase()]);
    db.runSync("INSERT INTO propriedades (id, usuario_id, localizacao_id, nome, codigo_estabelecimento, criado_em) VALUES (?, ?, ?, ?, ?, ?)", [propriedadeId, usuario.id, localizacaoId, nome.trim(), codigo.trim() || null, new Date().toISOString()]);
  });
}
