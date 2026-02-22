import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const nutritionPrompt = `
Você é um nutricionista especialista de elite. Analise o seguinte texto sobre uma refeição e o contexto do usuário abaixo.

CONXEXTO DO USUÁRIO:
- Idade: {age} anos
- Objetivo: {objective}
- Peso atual: {weight} kg

Analise a refeição e retorne APENAS um JSON estruturado com os seguintes campos:
- food_name: nome resumido e atraente da refeição
- calories: valor numérico total de calorias
- protein: gramas de proteína (numérico)
- carbs: gramas de carboidratos (numérico)
- fat: gramas de gordura (numérico)
- insight: Um conselho curto, motivador e técnico (máx 120 caracteres) correlacionando a refeição com o contexto do usuário.

Texto da Refeição: "{text}"
`;
