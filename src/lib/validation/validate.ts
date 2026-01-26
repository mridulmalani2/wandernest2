import { NextRequest } from 'next/server'
import { z, ZodTypeAny, ZodObject } from 'zod'

function ensureStrictSchema(schema: ZodTypeAny): ZodTypeAny {
  if (schema instanceof ZodObject) {
    return schema.strict()
  }
  return schema
}

export async function validateJson<T>(request: NextRequest, schema: ZodTypeAny): Promise<T> {
  const body = await request.json()
  const strictSchema = ensureStrictSchema(schema)
  return strictSchema.parse(body) as T
}

export function validateInput<T>(input: unknown, schema: ZodTypeAny): T {
  const strictSchema = ensureStrictSchema(schema)
  return strictSchema.parse(input) as T
}

export function safeParseJson<T>(input: unknown, schema: ZodTypeAny): T {
  const strictSchema = ensureStrictSchema(schema)
  return strictSchema.parse(input) as T
}

export { z }
