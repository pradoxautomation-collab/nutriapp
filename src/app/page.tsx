"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Zap, Waves, Flame, Camera, Loader2, History, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [mealText, setMealText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState({
    consumed: 0,
    target: 2000,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const fetchTodayMeals = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar refeições:", error);
      return;
    }

    if (data) {
      setMeals(data);
      const totals = data.reduce((acc, meal) => ({
        consumed: acc.consumed + Number(meal.calories),
        protein: acc.protein + Number(meal.protein),
        carbs: acc.carbs + Number(meal.carbs),
        fat: acc.fat + Number(meal.fat)
      }), { consumed: 0, protein: 0, carbs: 0, fat: 0 });

      setDailyData(prev => ({ ...prev, ...totals }));
    }
  };

  const handleAnalyze = async () => {
    if (!mealText) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ text: mealText }),
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.calories) {
        // Salvar no Supabase
        const { error: dbError } = await supabase
          .from("meals")
          .insert([{
            food_name: data.food_name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          }]);

        if (dbError) throw dbError;

        await fetchTodayMeals(); // Recarregar lista e totais
        setShowModal(false);
        setMealText("");
      }
    } catch (error) {
      console.error("Erro no fluxo de análise:", error);
      alert("Falha ao processar ou salvar a refeição.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-2xl font-bold text-nutridark flex items-center gap-2">
            <span className="text-nutrigreen text-3xl">🌿</span> NutriAI
          </h1>
          <p className="text-slate-500">Seu assistente nutricional inteligente</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Refeição
        </button>
      </header>

      {/* Resumo do Dia */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-nutridark">
          <Target className="text-nutrigreen" size={20} /> Resumo do Dia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DayCard label="Consumidas" value={dailyData.consumed} unit="kcal" />
          <DayCard label="Meta Diária" value={dailyData.target} unit="kcal" highlight />
          <DayCard label="Restantes" value={Math.max(dailyData.target - dailyData.consumed, 0)} unit="kcal" color="text-nutrigreen" />
        </div>

        {/* Macros */}
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-nutridark font-bold text-sm uppercase tracking-widest mb-2">Macronutrientes</h3>
          <MacroBar label="Proteínas" current={dailyData.protein} target={150} color="bg-orange-500" icon={<Zap size={14} />} />
          <MacroBar label="Carboidratos" current={dailyData.carbs} target={200} color="bg-blue-500" icon={<Waves size={14} />} />
          <MacroBar label="Gorduras" current={dailyData.fat} target={66} color="bg-yellow-500" icon={<Flame size={14} />} />
        </div>
      </section>

      {/* Histórico do Dia */}
      <section>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-nutridark">
          <History className="text-nutrigreen" size={20} /> Refeições de Hoje
        </h2>

        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
              <Utensils className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-400">Nenhuma refeição registrada hoje.</p>
            </div>
          ) : (
            meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-premium flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-nutridark">{meal.food_name}</h4>
                  <p className="text-xs text-slate-400">
                    {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-nutridark">{meal.calories}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Modal NutriAI Vision */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-nutridark"
              >
                ✕
              </button>

              <div className="text-center mb-8">
                <div className="bg-nutrigreen/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-nutrigreen" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-nutridark">NutriAI Vision</h3>
                <p className="text-slate-500 text-sm">Descreva o que você comeu para análise instantânea</p>
              </div>

              <textarea
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="Ex: 2 ovos fritos, uma fatia de pão integral e um café sem açúcar..."
                className="w-full h-32 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-nutrigreen focus:border-transparent outline-none transition-all resize-none mb-6 text-nutridark"
                disabled={isAnalyzing}
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !mealText}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Analisando sua refeição...
                  </>
                ) : "Analisar com IA"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DayCard({ label, value, unit, highlight = false, color = "text-nutridark" }: any) {
  return (
    <div className={`card-premium flex flex-col items-center justify-center text-center ${highlight ? 'border-nutrigreen/30 bg-nutrigreen/5' : ''}`}>
      <span className="text-slate-400 text-[10px] sm:text-xs mb-1 uppercase tracking-widest font-bold">{label}</span>
      <span className={`text-3xl sm:text-4xl font-black ${color}`}>{value.toLocaleString()}</span>
      <span className="text-slate-400 text-xs mt-1">{unit}</span>
    </div>
  );
}

function MacroBar({ label, current, target, color, icon }: any) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs sm:text-sm">
        <span className="font-bold text-slate-700 flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="text-slate-500">
          <span className="font-black text-nutridark">{current.toFixed(1)}g</span> / {target}g
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
