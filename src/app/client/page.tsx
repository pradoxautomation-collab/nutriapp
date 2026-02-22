"use client";

import { useState, useEffect } from "react";
import {
  Plus, Target, Zap, Waves, Flame, Camera,
  Loader2, History, Utensils, LogOut,
  ShieldCheck, User, Info, ChevronRight,
  TrendingUp, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [mealText, setMealText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dailyData, setDailyData] = useState({
    consumed: 0,
    target: 2000,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const [setupData, setSetupData] = useState({
    full_name: "",
    age: "",
    weight_kg: "",
    height_cm: "",
    objective: "maintaining",
    lgpd_consent: false
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "professional") {
        router.push("/pro");
        return;
      }

      setUser(session.user);
      fetchProfile(session.user.id);
      fetchTodayMeals(session.user.id);
    };
    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setDailyData(prev => ({ ...prev, target: data.calorie_goal || 2000 }));

      if (!data.lgpd_consent_at || !data.weight_kg) {
        setSetupData({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          height_cm: data.height_cm?.toString() || "",
          objective: data.objective || "maintaining",
          lgpd_consent: !!data.lgpd_consent_at
        });
        setShowProfileSetup(true);
      }
    }
  };

  const fetchTodayMeals = async (userId?: string) => {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", activeUserId)
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

  const handleUpdateProfile = async () => {
    if (!setupData.lgpd_consent) {
      alert("Você precisa aceitar a política de privacidade para continuar.");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: setupData.full_name,
          age: parseInt(setupData.age),
          weight_kg: parseFloat(setupData.weight_kg),
          height_cm: parseFloat(setupData.height_cm),
          objective: setupData.objective,
          lgpd_consent_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      setShowProfileSetup(false);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Por favor, preencha todos os campos corretamente.");
    }
  };

  const handleAnalyze = async () => {
    if (!mealText || !user) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          text: mealText,
          profile: {
            age: profile?.age,
            weight_kg: profile?.weight_kg,
            objective: profile?.objective
          }
        }),
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.calories) {
        const { error: dbError } = await supabase
          .from("meals")
          .insert([{
            user_id: user.id,
            food_name: data.food_name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            insights: data.insight // Assumindo que a API retornará um insight
          }]);

        if (dbError) throw dbError;

        await fetchTodayMeals();
        setShowModal(false);
        setMealText("");
      }
    } catch (error) {
      console.error("Erro no fluxo de análise:", error);
      alert("Falha ao analisar a refeição. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Top Bar - Premium & Clean */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-nutrigreen w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-nutrigreen/20">
              <span className="text-white text-xl font-black">N</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">NutriAI</h1>
              <span className="text-[10px] uppercase tracking-widest text-nutrigreen font-bold">Assistente Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-nutridark text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <Plus size={18} />
              <span>Nova Refeição</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Hero Section - Visual Narrative */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Stats Card */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-nutridark mb-2">
                    Olá, <span className="text-nutrigreen">{profile?.full_name?.split(' ')[0] || 'Usuário'}</span>
                  </h2>
                  <p className="text-slate-500 font-medium">Aqui está o balanço da sua saúde hoje.</p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                  <TrendingUp size={16} className="text-nutrigreen" />
                  <span className="text-sm font-bold text-slate-600">No Caminho</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Consumidas</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-nutridark">{dailyData.consumed}</span>
                    <span className="text-sm font-bold text-slate-400">kcal</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Meta Diária</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-300">{dailyData.target}</span>
                    <span className="text-sm font-bold text-slate-400">kcal</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Saldo</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${dailyData.consumed > dailyData.target ? 'text-red-500' : 'text-nutrigreen'}`}>
                      {Math.max(dailyData.target - dailyData.consumed, 0)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">restantes</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Design Decorative Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-nutrigreen/5 rounded-full blur-3xl"></div>
          </div>

          {/* Quick Insight Card */}
          <div className="lg:col-span-4 bg-nutrigreen border border-nutrigreen/20 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-nutrigreen/20">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-black mb-3">Insight do Dia</h3>
              <p className="text-white/80 text-sm leading-relaxed font-semibold">
                {dailyData.consumed === 0
                  ? "Aguardando sua primeira refeição para dar dicas de saúde."
                  : profile?.objective === 'losing' && dailyData.consumed > dailyData.target * 0.8
                    ? "Você está próximo da meta de déficit. Foque em fibras agora!"
                    : "Excelente progresso! Mantenha a hidratação alta."}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 bg-white text-nutridark py-4 rounded-3xl font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              Registrar agora <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* Nutritional Breakdown Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Macros & Progress */}
          <div className="md:col-span-7 space-y-6">
            <h3 className="text-xl font-black text-nutridark flex items-center gap-3 px-2">
              <Zap size={22} className="text-nutrigreen" /> Macronutrientes
            </h3>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-10">
              <MacroBar2 label="Proteínas" current={dailyData.protein} target={profile?.protein_goal || 150} color="bg-orange-500" />
              <MacroBar2 label="Carboidratos" current={dailyData.carbs} target={profile?.carbs_goal || 200} color="bg-blue-500" />
              <MacroBar2 label="Gorduras" current={dailyData.fat} target={profile?.fat_goal || 66} color="bg-yellow-500" />
            </div>
          </div>

          {/* Recent Meals List */}
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-xl font-black text-nutridark flex items-center gap-3 px-2">
              <History size={22} className="text-nutrigreen" /> Histórico
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {meals.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-dashed border-slate-200 text-center">
                  <Utensils className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold">Sem registros hoje</p>
                </div>
              ) : (
                meals.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-nutrigreen/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-nutrigreen/10 transition-colors">
                        🍽️
                      </div>
                      <div>
                        <h4 className="font-bold text-nutridark">{meal.food_name}</h4>
                        <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">
                          {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-nutridark">{meal.calories}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">kcal</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-nutridark/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full shadow-2xl relative my-auto"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-nutridark transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>

              <div className="mb-10">
                <div className="bg-nutrigreen/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6">
                  <Camera className="text-nutrigreen" size={32} />
                </div>
                <h3 className="text-3xl font-black text-nutridark mb-2">Refeição com IA</h3>
                <p className="text-slate-500 font-medium">Descreva o que você comeu de forma natural.</p>
              </div>

              <textarea
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="Ex: No almoço comi 2 colheres de arroz, um file de frango médio e salada de alface à vontade..."
                className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen outline-none transition-all resize-none mb-8 text-lg font-medium text-nutridark"
                disabled={isAnalyzing}
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !mealText}
                className="w-full bg-nutrigreen text-white py-5 rounded-[2rem] text-lg font-black flex items-center justify-center gap-3 disabled:opacity-30 shadow-2xl shadow-nutrigreen/20 active:scale-95 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processando...
                  </>
                ) : "Analisar Refeição"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileSetup && (
          <div className="fixed inset-0 bg-nutridark/95 backdrop-blur-2xl z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-10 md:p-14 max-w-3xl w-full shadow-3xl text-nutridark my-auto"
            >
              <div className="mb-10 text-center max-w-md mx-auto">
                <div className="bg-nutrigreen/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <User className="text-nutrigreen" size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-3 italic">Seja bem-vindo!</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Para o seu assistente funcionar perfeitamente, precisamos ajustar suas métricas biométricas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <InputField label="Nome Completo" value={setupData.full_name} onChange={(v) => setSetupData({ ...setupData, full_name: v })} placeholder="Como quer ser chamado?" />
                <InputField label="Idade" type="number" value={setupData.age} onChange={(v) => setSetupData({ ...setupData, age: v })} placeholder="Ex: 30" />
                <InputField label="Peso Atual (kg)" type="number" value={setupData.weight_kg} onChange={(v) => setSetupData({ ...setupData, weight_kg: v })} placeholder="Ex: 75" />
                <InputField label="Altura (cm)" type="number" value={setupData.height_cm} onChange={(v) => setSetupData({ ...setupData, height_cm: v })} placeholder="Ex: 170" />
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Seu Objetivo Principal</label>
                  <select
                    value={setupData.objective}
                    onChange={(e) => setSetupData({ ...setupData, objective: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-nutrigreen/20 appearance-none font-bold"
                  >
                    <option value="losing">🔥 Perder Peso (Déficit)</option>
                    <option value="maintaining">⚖️ Manter Peso (Equilíbrio)</option>
                    <option value="gaining">💪 Ganhar Massa (Superávit)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 mb-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      id="lgpd"
                      checked={setupData.lgpd_consent}
                      onChange={(e) => setSetupData({ ...setupData, lgpd_consent: e.target.checked })}
                      className="w-6 h-6 accent-nutrigreen cursor-pointer"
                    />
                  </div>
                  <label htmlFor="lgpd" className="text-sm font-medium text-slate-600 leading-relaxed cursor-pointer select-none">
                    <span className="font-black flex items-center gap-2 mb-2 text-nutridark tracking-tight text-lg">
                      <ShieldCheck size={20} className="text-nutrigreen" />
                      Segurança de Dados (LGPD)
                    </span>
                    Entendo que meus dados de saúde serão processados localmente e criptografados no banco de dados para fins nutricionais exclusivos.
                  </label>
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full bg-nutridark text-white py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Começar Minha Jornada
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MacroBar2({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-black text-nutridark text-lg italic tracking-tight">{label}</h4>
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Atingido: {percentage.toFixed(0)}%</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-nutridark">{current.toFixed(1)}g</span>
          <span className="text-sm font-bold text-slate-300"> / {target}g</span>
        </div>
      </div>
      <div className="h-4 bg-slate-50 rounded-full border border-slate-100 overflow-hidden shadow-inner p-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} rounded-full shadow-sm`}
        />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-nutrigreen/20 font-bold placeholder:text-slate-300 transition-all text-slate-900"
      />
    </div>
  );
}
