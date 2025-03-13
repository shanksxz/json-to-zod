"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { exampleJson, jsonToZodString } from "@/features/utils/json-to-zod";
import { Check, Clipboard, Code, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function JsonToZodConverter() {
	const [jsonInput, setJsonInput] = useState("");
	const [zodSchema, setZodSchema] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showTypes, setShowTypes] = useState(false);
	const isMobile = false;

	const convertToZod = () => {
		if (!jsonInput.trim()) {
			setZodSchema("");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const parsedJson = JSON.parse(jsonInput);
			const schema = jsonToZodString(parsedJson);
			setZodSchema(`import { z } from "zod";\n\nconst schema = ${schema}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid JSON");
			toast.error(err instanceof Error ? err.message : "Invalid JSON");
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = () => {
		const textToCopy = `import { z } from "zod";\n\nconst ${zodSchema}`;
		navigator.clipboard.writeText(textToCopy);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("The schema has been copied to your clipboard");
	};

	const clearAll = () => {
		setJsonInput("");
		setZodSchema("");
		setError(null);
	};

	const loadExample = () => {
		setJsonInput(JSON.stringify(exampleJson, null, 2));
	};

	return (
		<div className="grid gap-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="col-span-1">
					<CardContent className="pt-6">
						<div className="flex flex-col gap-4 h-full">
							<div className="flex justify-between items-center">
								<h2 className="text-lg font-medium flex items-center">
									<Code className="mr-2 h-5 w-5" />
									JSON Input
								</h2>
								<Button variant="outline" size="sm" onClick={loadExample}>
									Load Example
								</Button>
							</div>
							<Textarea
								placeholder="Paste your JSON here..."
								className="font-mono flex-1 min-h-[500px] resize-y"
								value={jsonInput}
								onChange={(e) => setJsonInput(e.target.value)}
							/>
							{error && <div className="text-destructive text-sm">{error}</div>}
							<div className="flex justify-between gap-2">
								<Button variant="outline" onClick={clearAll}>
									Clear
								</Button>
								<Button onClick={convertToZod} disabled={!jsonInput || isLoading}>
									{isLoading ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Converting...
										</>
									) : (
										"Convert to Zod"
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-1">
					<CardContent className="pt-6">
						<div className="flex flex-col gap-4 h-full">
							<div className="flex justify-between items-center">
								<h2 className="text-lg font-medium flex items-center">
									<Code className="mr-2 h-5 w-5" />
									{showTypes ? "Zod Schema & TypeScript Types" : "Zod Schema"}
								</h2>
								<Button
									variant="outline"
									size="sm"
									onClick={copyToClipboard}
									className="gap-2"
									disabled={!zodSchema}
								>
									{copied ? (
										<>
											<Check className="h-4 w-4" />
											Copied
										</>
									) : (
										<>
											<Clipboard className="h-4 w-4" />
											Copy
										</>
									)}
								</Button>
							</div>
							<pre className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm flex-1 min-h-[500px]">
								<code>{zodSchema ? zodSchema : "No schema generated yet"}</code>
							</pre>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="pt-6">
					<h2 className="text-lg font-medium mb-2">How to use</h2>
					<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
						<li>Paste your JSON in the left panel</li>
						<li>Toggle "Include TypeScript types" if you want type definitions</li>
						<li>Click "Convert to Zod" to generate the schema</li>
						<li>Copy the generated schema to your project</li>
						<li>
							Import the zod library in your project:{" "}
							<code className="bg-muted px-1 rounded">npm install zod</code>
						</li>
					</ol>
				</CardContent>
			</Card>
		</div>
	);
}
