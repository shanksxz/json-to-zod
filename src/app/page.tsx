import { JsonToZodConverter } from "@/features/components/json-convert";

export default function Home() {
	return (
		<main className="container mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-6 text-center">JSON to Zod Schema Converter</h1>
			<p className="text-center text-muted-foreground mb-8">
				Paste your JSON and get a Zod schema generated automatically
			</p>
			<JsonToZodConverter />
		</main>
	);
}
