import { NextRequest } from 'next/server'
import { z, ZodTypeAny, ZodObject, ZodEffects, ZodOptional, ZodNullable, ZodDefault } from 'zod'

function unwrapObjectSchema(schema: ZodTypeAny): ZodObject | null {
  if (schema instanceof ZodObject) {
    return schema
  }
  if (schema instanceof ZodEffects) {
    return unwrapObjectSchema(schema._def.schema as ZodTypeAny)
  }
  if (schema instanceof ZodOptional || schema instanceof ZodNullable || schema instanceof ZodDefault) {
    return unwrapObjectSchema(schema._def.innerType as ZodTypeAny)
  }
  return null
}

function ensureStrictSchema(schema: ZodTypeAny, payload: unknown): void {
  const objectSchema = unwrapObjectSchema(schema)
  if (!objectSchema) {
    return
  }
  objectSchema.strict().parse(payload)
}

export async function validateJson<T>(request: NextRequest, schema: ZodTypeAny): Promise<T> {
  const body = await request.json()
  ensureStrictSchema(schema, body)
  return schema.parse(body) as T
}

export function validateInput<T>(input: unknown, schema: ZodTypeAny): T {
  ensureStrictSchema(schema, input)
  return schema.parse(input) as T
}

export function safeParseJson<T>(input: unknown, schema: ZodTypeAny): T {
  ensureStrictSchema(schema, input)
  return schema.parse(input) as T
}

export { z }
