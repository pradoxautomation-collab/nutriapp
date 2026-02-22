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
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile) {
        console.warn("Perfil não encontrado ou erro. Redirecionando...", error);
        // Se o usuário existe no Auth mas não no Profiles (ex: reset de DB)
        // O melhor é deslogar para limpar a sessão local
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // Redirecionamento baseado no Role
      if (profile.role === "professional") {
        router.push("/pro");
      } else {
        router.push("/client");
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
