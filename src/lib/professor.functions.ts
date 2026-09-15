import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Senha do professor. Configurável pelo segredo SENHA_PROFESSOR do projeto;
 * sem o segredo, vale a senha abaixo.
 */
const SENHA_PADRAO = "robotica8";

export const conferirSenhaProfessor = createServerFn({ method: "POST" })
  .inputValidator((dados) => z.object({ senha: z.string() }).parse(dados))
  .handler(async ({ data }) => {
    const esperada = process.env["SENHA_PROFESSOR"] || SENHA_PADRAO;
    return { ok: data.senha.trim() === esperada };
  });
