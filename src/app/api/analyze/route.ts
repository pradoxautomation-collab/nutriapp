import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, nutritionPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { text, profile } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Texto não fornecido" }, { status: 400 });
        }

        const model = getGeminiModel();
        const prompt = nutritionPrompt
            .replace("{text}", text)
            .replace("{age}", profile?.age?.toString() || "30")
            .replace("{weight}", profile?.weight_kg?.toString() || "70")
            .replace("{objective}", profile?.objective || "manter peso");

        const result = await model.generateContent(prompt);
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
