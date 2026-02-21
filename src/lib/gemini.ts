import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const nutritionPrompt = `
Você é um nutricionista especialista. Analise o seguinte texto sobre uma refeição e retorne APENAS um JSON estruturado com os seguintes campos:
- food_name: nome resumido da refeição
- calories: valor numérico total de calorias
- protein: gramas de proteína (numérico)
- carbs: gramas de carboidratos (numérico)
- fat: gramas de gordura (numérico)

Texto: "{text}"
`;
