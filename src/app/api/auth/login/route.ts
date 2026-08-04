import { NextResponse } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/api-handler";
import { createAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DUMMY_HASH_FOR_TIMING, verifyPassword } from "@/lib/password";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const POST = withValidation(schema, async (body) => {
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() }
  });

  // Siempre corremos scrypt, exista o no el usuario, y sea o no válida la
  // contraseña, para que ambos casos tomen el mismo tiempo. Si no se
  // hiciera, un atacante podría medir el tiempo de respuesta para saber
  // qué correos están registrados (email enumeration por timing).
  const valid = await verifyPassword(
    body.password,
    user?.passwordHash ?? DUMMY_HASH_FOR_TIMING
  );

  if (!user?.passwordHash || !valid) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  await createAuthSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
