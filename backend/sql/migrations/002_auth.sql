
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS senha_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_unique
ON usuarios (lower(email))
WHERE email IS NOT NULL;
