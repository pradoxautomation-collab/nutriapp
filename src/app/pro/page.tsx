"use client";

import { useState, useEffect } from "react";
import {
    Users, Calendar, CheckSquare, MessageSquare,
    Settings, LogOut, Search, Plus, TrendingUp,
    LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
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

            if (profile?.role !== "professional") {
                router.push("/");
                return;
            }
            setProfile(profile);
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Professional */}
            <aside className="w-72 bg-nutridark text-white hidden lg:flex flex-col p-8 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-nutrigreen w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-nutrigreen/20">
                        <span className="text-white text-xl font-black">N</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tighter italic">NutriPro</h1>
                </div>

                <nav className="space-y-2 flex-grow">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<Users size={20} />} label="Pacientes" />
                    <NavItem icon={<Calendar size={20} />} label="Agenda" />
                    <NavItem icon={<CheckSquare size={20} />} label="Tarefas" />
                    <NavItem icon={<MessageSquare size={20} />} label="Mensagens" />
                    <NavItem icon={<Settings size={20} />} label="Configurações" />
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 text-slate-400 hover:text-white transition-colors p-3 rounded-2xl"
                >
                    <LogOut size={20} />
                    <span className="font-bold">Sair do Painel</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 md:p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-nutridark tracking-tight mb-2 italic">
                            Olá, Dr. {profile?.full_name?.split(' ')[0] || 'Nutri'}
                        </h2>
                        <p className="text-slate-500 font-medium">Você tem 4 consultas confirmadas para hoje.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                placeholder="Buscar paciente..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-nutrigreen/20 w-64 font-medium transition-all"
                            />
                        </div>
                        <button className="bg-nutrigreen text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-nutrigreen-dark shadow-lg shadow-nutrigreen/20 transition-all active:scale-95">
                            <Plus size={20} />
                            <span>Novo Paciente</span>
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard label="Total de Pacientes" value="128" icon={<Users className="text-nutrigreen" />} trend="+12%" />
                    <StatCard label="Consultas este mês" value="42" icon={<Calendar className="text-blue-500" />} trend="+5%" />
                    <StatCard label="Taxa de Adesão" value="84%" icon={<TrendingUp className="text-orange-500" />} trend="+3%" />
                </div>

                {/* Patients Table Placeholder */}
                <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black mb-8 italic">Pacientes Recentes</h3>
                    <div className="space-y-6">
                        <PatientRow name="Thiago Caramigo" date="Hoje, 14:00" status="Confirmado" />
                        <PatientRow name="Ana Pereira" date="Hoje, 15:30" status="Pendente" />
                        <PatientRow name="Marcos Oliveira" date="Amanhã, 09:00" status="Confirmado" />
                    </div>
                </section>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-nutrigreen text-white shadow-xl shadow-nutrigreen/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            {icon}
            <span className="font-bold">{label}</span>
        </div>
    );
}

function StatCard({ label, value, icon, trend }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                <span className="text-nutrigreen text-xs font-black bg-nutrigreen/5 px-2 py-1 rounded-lg">{trend}</span>
            </div>
            <h4 className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{label}</h4>
            <span className="text-3xl font-black text-nutridark italic">{value}</span>
        </div>
    );
}

function PatientRow({ name, date, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">👤</div>
                <div>
                    <h5 className="font-black text-nutridark">{name}</h5>
                    <span className="text-xs font-medium text-slate-400">{date}</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${status === 'Confirmado' ? 'bg-nutrigreen/10 text-nutrigreen' : 'bg-orange-50 text-orange-400'}`}>
                    {status}
                </span>
                <button className="text-nutrigreen font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity">Ver Ficha</button>
            </div>
        </div>
    );
}
