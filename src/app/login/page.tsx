"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, Loader2, ShieldCheck, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

type AuthView = "login" | "signup" | "forgot-password" | "forgot-success";

export default function LoginPage() {
    const [view, setView] = useState<AuthView>("login");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<"client" | "professional">("client");
    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (profile) {
                        router.push(profile.role === "professional" ? "/pro" : "/client");
                    } else {
                        router.push("/");
                    }
                }
            } catch (err) {
                console.error("Erro no checkUser:", err);
            }
        };
        checkUser();
    }, [router]);

    const resetState = (newView: AuthView) => {
        setError(null);
        setView(newView);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (view === "signup" && password !== confirmPassword) {
            setError("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        if (view === "signup" && password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setLoading(false);
            return;
        }

        try {
            if (view === "login") {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                if (data.user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", data.user.id)
                        .maybeSingle();

                    if (profile) {
                        router.push(profile.role === "professional" ? "/pro" : "/client");
                    } else {
                        router.push("/");
                    }
                }
                router.refresh();
            } else if (view === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                            full_name: email.split("@")[0],
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro na autenticação.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setView("forgot-success");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao enviar e-mail.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-nutrigreen/10 via-slate-50 to-slate-100">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.5))] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-nutrigreen/10 rounded-full blur-3xl"></div>

                    <AnimatePresence mode="wait">

                        {/* ===== VIEW: FORGOT PASSWORD SUCCESS ===== */}
                        {view === "forgot-success" && (
                            <motion.div key="forgot-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                                <div className="bg-nutrigreen/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <Mail className="text-nutrigreen" size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-nutridark mb-3">E-mail Enviado!</h2>
                                <p className="text-slate-500 font-medium mb-8">Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.</p>
                                <button onClick={() => resetState("login")} className="text-sm font-black text-nutrigreen hover:text-nutrigreen-dark transition-colors uppercase tracking-widest flex items-center gap-2 mx-auto">
                                    <ArrowLeft size={16} /> Voltar ao Login
                                </button>
                            </motion.div>
                        )}

                        {/* ===== VIEW: FORGOT PASSWORD FORM ===== */}
                        {view === "forgot-password" && (
                            <motion.div key="forgot-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="text-center mb-10 relative z-10">
                                    <motion.div whileHover={{ scale: 1.05 }} className="bg-nutrigreen w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-nutrigreen/20">
                                        <KeyRound className="text-white" size={40} />
                                    </motion.div>
                                    <h1 className="text-3xl font-black text-nutridark tracking-tight">Recuperar Acesso</h1>
                                    <p className="text-slate-500 font-medium mt-2">Enviaremos um link para redefinir sua senha</p>
                                </div>
                                <form onSubmit={handleForgotPassword} className="space-y-6 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu E-mail</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nutrigreen transition-colors" size={20} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="exemplo@email.com"
                                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen outline-none transition-all text-nutridark font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                                            <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                                            {error}
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={loading} className="w-full bg-nutrigreen text-white py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-nutrigreen/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : <><Mail size={20} /> Enviar Link de Recuperação</>}
                                    </button>
                                </form>
                                <div className="mt-8 text-center">
                                    <button onClick={() => resetState("login")} className="text-sm font-black text-slate-400 hover:text-nutridark transition-colors flex items-center gap-2 mx-auto">
                                        <ArrowLeft size={16} /> Voltar ao Login
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ===== VIEW: LOGIN & SIGNUP ===== */}
                        {(view === "login" || view === "signup") && (
                            <motion.div key="auth-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="text-center mb-10 relative z-10">
                                    <motion.div whileHover={{ scale: 1.05 }} className="bg-nutrigreen w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-nutrigreen/20">
                                        <ShieldCheck className="text-white" size={40} />
                                    </motion.div>
                                    <h1 className="text-3xl font-black text-nutridark tracking-tight italic">
                                        {view === "login" ? "Acessar NutriApp" : "Juntar-se à Elite"}
                                    </h1>
                                    <p className="text-slate-500 font-medium mt-2">
                                        {view === "login" ? "Seu portal nutricional profissional" : "Escolha como quer começar sua jornada"}
                                    </p>
                                </div>

                                {view === "signup" && (
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <button onClick={() => setRole("client")} className={`py-4 rounded-3xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${role === 'client' ? 'border-nutrigreen bg-nutrigreen/5 text-nutrigreen' : 'border-slate-100 text-slate-400'}`}>
                                            <UserPlus size={20} />
                                            <span className="text-xs uppercase tracking-widest">Paciente</span>
                                        </button>
                                        <button onClick={() => setRole("professional")} className={`py-4 rounded-3xl border-2 transition-all font-bold flex flex-col items-center gap-2 ${role === 'professional' ? 'border-nutrigreen bg-nutrigreen/5 text-nutrigreen' : 'border-slate-100 text-slate-400'}`}>
                                            <ShieldCheck size={20} />
                                            <span className="text-xs uppercase tracking-widest">Nutricionista</span>
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nutrigreen transition-colors" size={20} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen outline-none transition-all text-nutridark font-bold" required />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Senha de Acesso</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nutrigreen transition-colors" size={20} />
                                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen outline-none transition-all text-nutridark font-bold placeholder:text-slate-300" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-nutridark transition-colors">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {view === "signup" && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                                                <div className="relative group">
                                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nutrigreen transition-colors" size={20} />
                                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita sua senha" className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen outline-none transition-all text-nutridark font-bold placeholder:text-slate-300" required />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                                            <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                                            {error}
                                        </motion.div>
                                    )}

                                    <button type="submit" disabled={loading} className="w-full bg-nutridark text-white py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-nutridark/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden">
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : view === "login" ? <><LogIn size={20} /> Entrar no App</> : <><UserPlus size={20} /> Finalizar Cadastro</>}
                                    </button>

                                    {/* Botão "Esqueci minha senha" - só no modo login */}
                                    {view === "login" && (
                                        <div className="text-center">
                                            <button type="button" onClick={() => resetState("forgot-password")} className="text-xs font-bold text-slate-400 hover:text-nutrigreen transition-colors underline underline-offset-4">
                                                Esqueci minha senha
                                            </button>
                                        </div>
                                    )}
                                </form>

                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => resetState(view === "login" ? "signup" : "login")}
                                        className="text-sm font-black text-nutrigreen hover:text-nutrigreen-dark transition-colors uppercase tracking-widest"
                                    >
                                        {view === "login" ? "Ainda não tem conta? Clique aqui" : "Já possui acesso? Faça Login"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    Nutri App © 2026 • Inteligência Nutricional
                </p>
            </motion.div>
        </main>
    );
}
