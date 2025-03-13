import { z } from "zod";

/**
 * Infer a Zod schema from a JSON object
 * @param json The JSON object to infer the schema from
 * @returns A Zod schema
 */
export function inferZSchema(json: any): z.ZodTypeAny {
	if (json === null) return z.null();
	const type = Array.isArray(json) ? "array" : typeof json;

	switch (type) {
		case "string":
			return z.string();
		case "number":
			return Number.isInteger(json) ? z.number().int() : z.number();
		case "boolean":
			return z.boolean();
		case "undefined":
			return z.undefined();
		case "array": {
			//TODO: check if all items are the same type
			if (json.length === 0) return z.array(z.unknown());
			const infer = inferZSchema(json[0]);
			return z.array(infer);
		}
		case "object":
			const shape: Record<string, z.ZodTypeAny> = {};
			for (const [key, value] of Object.entries(json)) {
				shape[key] = inferZSchema(value);
			}
			return z.object(shape);
		default:
			return z.unknown();
	}
}

/**
 * Helper function to get the type of a Zod schema
 * @param schema The Zod schema
 * @returns A string representing the schema type
 */
export function getSchemaType(schema: z.ZodTypeAny): string {
	if (schema instanceof z.ZodNull) return "null";
	if (schema instanceof z.ZodString) return "string";
	if (schema instanceof z.ZodNumber) return "number";
	if (schema instanceof z.ZodBoolean) return "boolean";
	if (schema instanceof z.ZodUndefined) return "undefined";
	if (schema instanceof z.ZodArray) return "array";
	if (schema instanceof z.ZodObject) return "object";
	if (schema instanceof z.ZodUnion) return "union";
	return "unknown";
}

/**
 * Converts a Zod schema to its string representation
 * @param schema The Zod schema to convert
 * @param indentLevel The current indentation level (used for formatting nested objects)
 * @returns A string representation of the Zod schema code
 */
export function zodSchemaToString(schema: z.ZodTypeAny, indentLevel = 0): string {
	const indent = "  ".repeat(indentLevel);
	const nestedIndent = "  ".repeat(indentLevel + 1);

	if (schema instanceof z.ZodNull) {
		return "z.null()";
	} else if (schema instanceof z.ZodString) {
		return "z.string()";
	} else if (schema instanceof z.ZodNumber) {
		const description = (schema as any)._def.checks || [];
		const isInt = description.some((check: any) => check.kind === "int");
		return isInt ? "z.number().int()" : "z.number()";
	} else if (schema instanceof z.ZodBoolean) {
		return "z.boolean()";
	} else if (schema instanceof z.ZodUndefined) {
		return "z.undefined()";
	} else if (schema instanceof z.ZodArray) {
		const elementSchema = (schema as any)._def.type;
		const elementSchemaStr = zodSchemaToString(elementSchema, indentLevel);
		return `z.array(${elementSchemaStr})`;
	} else if (schema instanceof z.ZodUnion) {
		const options = (schema as any)._def.options;
		const optionsStr = options.map((option: z.ZodTypeAny) => zodSchemaToString(option, indentLevel)).join(", ");
		return `z.union([${optionsStr}])`;
	} else if (schema instanceof z.ZodObject) {
		const shape = (schema as any)._def.shape();
		const entries = Object.entries(shape);
		if (entries.length === 0) {
			return "z.object({})";
		}
		const shapeString = entries
			.map(([key, value]: [string, any]) => {
				const valueStr = zodSchemaToString(value as z.ZodTypeAny, indentLevel + 1);
				const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`;
				return `${nestedIndent}${safeKey}: ${valueStr}`;
			})
			.join(",\n");
		return `z.object({\n${shapeString}\n${indent}})`;
	}
	return "z.unknown()";
}

/**
 * Converts a JSON object to a Zod schema string
 * @param json The JSON object to convert
 * @returns A string representation of the Zod schema
 */
export function jsonToZodString(json: any): string {
	const schema = inferZSchema(json);
	return zodSchemaToString(schema);
}

export const exampleJson = {
	name: "John",
	age: 30,
	isAdmin: false,
	roles: ["admin", "user"],
	address: {
		street: "123 Main St",
		city: "Anytown",
		zip: "12345",
	},
	createdAt: "2023-01-01T00:00:00Z",
};
