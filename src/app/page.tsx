"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      try {
        // 1. Verificar sessão ativa
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // 2. Buscar ou criar o perfil do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle(); // maybeSingle() retorna null sem erro se não encontrar

        if (!profile) {
          // Perfil não existe — criar automaticamente com dados do cadastro
          const role = user.user_metadata?.role || "client";
          const full_name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

          const { data: newProfile } = await supabase
            .from("profiles")
            .upsert({ id: user.id, role, full_name }, { onConflict: "id" })
            .select("role")
            .single();

          const finalRole = newProfile?.role || role;
          router.push(finalRole === "professional" ? "/pro" : "/client");
          return;
        }

        // 3. Redirecionar baseado no role
        router.push(profile.role === "professional" ? "/pro" : "/client");

      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        // Se der qualquer erro, manda para login SEM chamar signOut
        // (signOut causava o loop: login → signOut → login)
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-nutrigreen w-16 h-16 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-nutrigreen/20">
        <span className="text-white text-3xl font-black italic">N</span>
      </div>
      <div className="flex items-center gap-3 text-slate-400 font-bold">
        <Loader2 className="animate-spin" size={20} />
        <span className="tracking-widest uppercase text-[10px]">Autenticando Portal...</span>
      </div>
    </div>
  );
}
