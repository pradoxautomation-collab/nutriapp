"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, Users, BarChart2, Brain, ArrowRight,
  CheckCircle, Star, Zap, FileText, Calendar
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans overflow-hidden">

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-nutrigreen w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-nutrigreen/30">
              <span className="text-white font-black text-lg italic">N</span>
            </div>
            <div>
              <span className="font-black text-nutridark text-lg tracking-tight">NutriApp</span>
              <span className="text-nutrigreen font-black text-xs ml-1">PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-500 font-bold text-sm hover:text-nutridark transition-colors">
              Entrar
            </Link>
            <Link href="/login" className="bg-nutrigreen text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-nutrigreen/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              Começar Grátis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-nutrigreen/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-nutrigreen/10 text-nutrigreen px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Zap size={12} />
              Plataforma Nutricional Profissional
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-nutridark leading-none tracking-tight mb-6">
              Gestão clínica
              <span className="block text-nutrigreen italic">inteligente</span>
              para nutricionistas
            </h1>

            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
              Do prontuário digital à análise de refeições com IA — tudo em uma plataforma
              criada para elevar o cuidado nutricional ao próximo nível.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-nutridark text-white px-8 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Acesse seu Painel <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="bg-white text-nutridark px-8 py-5 rounded-[2rem] font-black text-lg border border-slate-200 hover:border-nutrigreen hover:text-nutrigreen transition-all flex items-center justify-center gap-3"
              >
                <Users size={20} />
                Sou Paciente
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-nutridark mb-4">
              Tudo que seu consultório precisa
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
              Uma plataforma completa, do primeiro atendimento ao acompanhamento contínuo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestão de Pacientes",
                desc: "Fichas clínicas completas com alergias, histórico médico, bioimpedância e evolução de peso.",
                color: "bg-nutrigreen/10 text-nutrigreen"
              },
              {
                icon: Brain,
                title: "IA Nutricional",
                desc: "Análise automática de refeições via texto com cálculo preciso de calorias e macronutrientes.",
                color: "bg-blue-100 text-blue-500"
              },
              {
                icon: FileText,
                title: "Planos Alimentares",
                desc: "Monte planos personalizados e exporte PDFs profissionais com a sua marca.",
                color: "bg-orange-100 text-orange-500"
              },
              {
                icon: BarChart2,
                title: "Evolução em Gráficos",
                desc: "Visualize tendências de peso, macros e adesão ao plano com dashboards interativos.",
                color: "bg-purple-100 text-purple-500"
              },
              {
                icon: Calendar,
                title: "Agenda Integrada",
                desc: "Controle de consultas, lembretes automáticos e histórico de atendimentos.",
                color: "bg-yellow-100 text-yellow-600"
              },
              {
                icon: ShieldCheck,
                title: "Segurança Total",
                desc: "Conformidade com LGPD, criptografia de dados sensíveis e acesso por roles.",
                color: "bg-red-100 text-red-500"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] border border-slate-100 hover:border-nutrigreen/30 hover:shadow-xl hover:-translate-y-1 transition-all group bg-white"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-nutridark mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />)}
          </div>
          <blockquote className="text-2xl md:text-3xl font-black text-nutridark italic mb-8 leading-snug">
            &ldquo;O NutriApp transformou o meu consultório. Consigo acompanhar 3x mais pacientes com muito mais qualidade.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-nutrigreen rounded-full flex items-center justify-center">
              <span className="text-white font-black">A</span>
            </div>
            <div className="text-left">
              <p className="font-black text-nutridark">Ana Carolina Silva</p>
              <p className="text-slate-400 text-sm font-medium">Nutricionista • CRN-3 12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 px-6 bg-nutridark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(100,200,100,0.15),_transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Pronto para elevar seu
            <span className="text-nutrigreen"> consultório?</span>
          </h2>
          <p className="text-white/60 font-medium text-lg mb-10">
            Junte-se aos nutricionistas que já transformaram sua prática com inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-nutrigreen text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-nutrigreen/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Acessar Plataforma <ArrowRight size={20} />
            </Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8 text-white/40 text-sm font-medium">
            {["Sem cartão de crédito", "Configuração em 5 min", "Suporte especializado"].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-nutrigreen" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-6 bg-nutridark border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-nutrigreen w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs italic">N</span>
            </div>
            <span className="text-white/40 text-sm font-bold">NutriApp Pro © 2026</span>
          </div>
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
            Inteligência Nutricional • LGPD Compliant
          </p>
        </div>
      </footer>

    </main>
  );
}
