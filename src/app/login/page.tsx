"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                alert("Verifique seu e-mail para confirmar o cadastro!");
            }
            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100"
            >
                <div className="text-center mb-8">
                    <div className="bg-nutrigreen/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn className="text-nutrigreen" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-nutridark">
                        {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        {isLogin
                            ? "Acesse seu painel nutricional inteligente"
                            : "Comece sua jornada saudável agora"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-nutrigreen/20 focus:border-nutrigreen outline-none transition-all text-nutridark"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-nutrigreen/20 focus:border-nutrigreen outline-none transition-all text-nutridark"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl border border-red-100"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : isLogin ? (
                            <>
                                <LogIn size={20} /> Entrar
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} /> Cadastrar
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-semibold text-nutrigreen hover:text-nutrilight transition-colors"
                    >
                        {isLogin
                            ? "Não tem uma conta? Cadastre-se aqui"
                            : "Já tem uma conta? Entre agora"}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
