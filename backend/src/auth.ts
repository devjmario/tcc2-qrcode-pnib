
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHmac,
} from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction, Express } from "express";
import { pool } from "./db";

const scrypt = promisify(scryptCallback);
const secret = process.env.AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "Configure AUTH_SECRET com pelo menos 32 caracteres no backend/.env"
  );
}

const key = secret;
const lifetime = 30 * 24 * 60 * 60;

const encode = (data: object) =>
  Buffer.from(JSON.stringify(data)).toString("base64url");

function sign(payload: string) {
  return createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
}

function tokenFor(id: string) {
  const payload = encode({
    sub: id,
    exp: Math.floor(Date.now() / 1000) + lifetime,
  });

  return `${payload}.${sign(payload)}`;
}

function decodeToken(
  token: string
): { sub: string; exp: number } | null {
  const [payload, signature, extra] = token.split(".");

  if (!payload || !signature || extra !== undefined) return null;

  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const obj = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    return typeof obj.sub === "string" &&
      Number.isSafeInteger(obj.exp) &&
      obj.exp > Date.now() / 1000
      ? obj
      : null;
  } catch {
    return null;
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (
    (await scrypt(password, salt, 64)) as Buffer
  ).toString("hex");

  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");

  if (!salt || !hash || !/^[0-9a-f]{128}$/.test(hash)) {
    return false;
  }

  const a = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(a, Buffer.from(hash, "hex"));
}

export function registerAuthRoutes(app: Express) {
  app.post("/auth/register", async (req, res) => {
    const { nome, email, senha } = req.body || {};

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      typeof email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      typeof senha !== "string" ||
      senha.length < 10 ||
      senha.length > 128
    ) {
      res.status(400).json({
        erro: "Informe nome, e-mail válido e senha de 10 a 128 caracteres.",
      });
      return;
    }

    try {
      const passwordHash = await hashPassword(senha);

      const result = await pool.query(
        `INSERT INTO usuarios
          (id, nome, email, senha_hash, criado_em)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id, nome, email, telefone, criado_em`,
        [nome.trim(), email.trim().toLowerCase(), passwordHash]
      );

      const usuario = result.rows[0];

      res.status(201).json({
        usuario,
        token: tokenFor(usuario.id),
      });
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(409).json({ erro: "E-mail já cadastrado." });
        return;
      }

      console.error(error);
      res.status(500).json({ erro: "Falha ao cadastrar usuário." });
    }
  });

  app.post("/auth/login", async (req, res) => {
    const { email, senha } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string"
    ) {
      res.status(400).json({ erro: "Credenciais inválidas." });
      return;
    }

    try {
      const result = await pool.query(
        `SELECT id, nome, email, telefone, criado_em, senha_hash
         FROM usuarios
         WHERE lower(email) = lower($1)`,
        [email.trim()]
      );

      const usuario = result.rows[0];

      if (
        !usuario?.senha_hash ||
        !(await verifyPassword(senha, usuario.senha_hash))
      ) {
        res.status(401).json({
          erro: "E-mail ou senha incorretos.",
        });
        return;
      }

      const { senha_hash, ...dadosUsuario } = usuario;

      res.json({
        usuario: dadosUsuario,
        token: tokenFor(usuario.id),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Falha na autenticação." });
    }
  });
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization
    ?.match(/^Bearer (.+)$/)?.[1];

  const decoded = token ? decodeToken(token) : null;

  if (!decoded) {
    res.status(401).json({
      erro: "Sessão inválida ou expirada. Faça login novamente.",
    });
    return;
  }

  res.locals.userId = decoded.sub;
  next();
}
