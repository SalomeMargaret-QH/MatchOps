import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

/**
 * Envuelve un handler de ruta que espera un body JSON validado con Zod.
 *
 * Antes, cada endpoint hacía `schema.parse(await request.json())` sin
 * try/catch: un body inválido lanzaba un ZodError sin capturar y Next.js
 * lo convertía en un 500 genérico, sin indicar qué campo falló.
 *
 * Con este wrapper, un body inválido devuelve un 400 con el detalle de
 * cada campo, y un JSON malformado devuelve un 400 en vez de reventar.
 *
 * Uso:
 *   export const POST = withValidation(schema, async (body, request) => {
 *     ...
 *     return NextResponse.json({ ok: true });
 *   });
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (body: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud debe ser JSON válido." },
        { status: 400 }
      );
    }

    const result = schema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos.",
          details: result.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    try {
      return await handler(result.data, request);
    } catch (error) {
      return handleUnexpectedError(error);
    }
  };
}

/**
 * Envuelve un handler sin body (GET, o rutas con solo params) para que
 * cualquier error inesperado devuelva un 500 controlado en vez de
 * dejar que Next.js muestre un stack trace genérico.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleUnexpectedError(error);
    }
  };
}

/**
 * Variante de bajo nivel para rutas con parámetros dinámicos (`[id]`),
 * donde la firma del handler (request, context) no encaja con
 * withValidation. Valida el body y devuelve { data } o { response } con
 * el error 400 ya armado, para usar así dentro de la ruta:
 *
 *   const parsed = await parseJsonWithSchema(request, schema);
 *   if ("response" in parsed) return parsed.response;
 *   const body = parsed.data;
 */
export async function parseJsonWithSchema<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { response: NextResponse }> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      response: NextResponse.json(
        { error: "El cuerpo de la solicitud debe ser JSON válido." },
        { status: 400 }
      )
    };
  }

  const result = schema.safeParse(rawBody);

  if (!result.success) {
    return {
      response: NextResponse.json(
        {
          error: "Datos inválidos.",
          details: result.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    };
  }

  return { data: result.data };
}

function handleUnexpectedError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  console.error("[api-error]", error);

  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Inténtalo de nuevo." },
    { status: 500 }
  );
}
