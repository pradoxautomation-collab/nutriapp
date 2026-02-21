import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, nutritionPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Texto não fornecido" }, { status: 400 });
        }

        const model = getGeminiModel();
        const result = await model.generateContent(nutritionPrompt.replace("{text}", text));
        const responseText = result.response.text();

        // Limpa a resposta para garantir que seja apenas o JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Resposta da IA não contém um JSON válido");
        }

        const nutritionData = JSON.parse(jsonMatch[0]);

        return NextResponse.json(nutritionData);
    } catch (error) {
        console.error("Erro na análise Gemini:", error);
        return NextResponse.json({ error: "Falha ao analisar nutrição" }, { status: 500 });
    }
}
