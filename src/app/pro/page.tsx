"use client";

import { useState, useEffect } from "react";
import {
    Users, Calendar, CheckSquare, MessageSquare,
    Settings, LogOut, Search, Plus, TrendingUp,
    LayoutDashboard, X, FileText, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newPatient, setNewPatient] = useState({
        full_name: "",
        email: "",
        age: "",
        weight: "",
        height: "",
        allergies: "",
        medical_history: ""
    });

    const fetchPatients = async (userId: string) => {
        const { data: patientList } = await supabase
            .from("profiles")
            .select("*")
            .eq("professional_id", userId)
            .order("created_at", { ascending: false });

        if (patientList) setPatients(patientList);
    };

    useEffect(() => {
        const checkAuthAndFetch = async () => {
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
            await fetchPatients(session.user.id);
            setLoading(false);
        };
        checkAuthAndFetch();
    }, [router]);

    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada");

            // No fluxo profissional real:
            // 1. O Nutri envia um convite por e-mail (usamos sign-up mockado com senha padrão ou metadata)
            // Para o MVP: Criamos o usuário via admin ou apenas o perfil com professional_id

            const { data, error } = await supabase
                .from("profiles")
                .insert({
                    id: crypto.randomUUID(), // Temporário até vinculação real via Auth
                    full_name: newPatient.full_name,
                    role: "client",
                    professional_id: session.user.id,
                    age: parseInt(newPatient.age),
                    weight_kg: parseFloat(newPatient.weight),
                    height_cm: parseFloat(newPatient.height),
                    allergies: newPatient.allergies,
                    medical_history: newPatient.medical_history,
                });

            if (error) throw error;

            alert("Paciente " + newPatient.full_name + " cadastrado com sucesso!");
            setIsModalOpen(false);
            setNewPatient({ full_name: "", email: "", age: "", weight: "", height: "", allergies: "", medical_history: "" });
            await fetchPatients(session.user.id);
        } catch (err: any) {
            console.error("Erro ao cadastrar:", err);
            alert("Erro: " + err.message);
        } finally {
            setLoading(false);
        }
    };

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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-nutrigreen/20 w-64 font-medium transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-nutrigreen text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-nutrigreen-dark shadow-lg shadow-nutrigreen/20 transition-all active:scale-95"
                        >
                            <Plus size={20} />
                            <span>Novo Paciente</span>
                        </button>
                    </div>
                </header>

                {/* Modal Novo Paciente */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nutridark/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 md:p-12">
                                    <div className="flex justify-between items-center mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-nutridark italic tracking-tight">Novo Cadastro</h3>
                                            <p className="text-slate-500 font-medium">Preencha a ficha clínica inicial do paciente.</p>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-3 rounded-2xl text-slate-400 hover:text-nutridark transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddPatient} className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ModalInput label="Nome Completo" placeholder="Ex: João Silva" value={newPatient.full_name} onChange={(v) => setNewPatient({ ...newPatient, full_name: v })} />
                                            <ModalInput label="E-mail de Acesso" placeholder="joao@email.com" type="email" value={newPatient.email} onChange={(v) => setNewPatient({ ...newPatient, email: v })} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <ModalInput label="Idade" placeholder="00" value={newPatient.age} onChange={(v) => setNewPatient({ ...newPatient, age: v })} />
                                            <ModalInput label="Peso (kg)" placeholder="0.0" value={newPatient.weight} onChange={(v) => setNewPatient({ ...newPatient, weight: v })} />
                                            <ModalInput label="Altura (cm)" placeholder="000" value={newPatient.height} onChange={(v) => setNewPatient({ ...newPatient, height: v })} />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <AlertCircle size={12} className="text-orange-400" /> Alergias Alimentares
                                                </label>
                                                <textarea
                                                    placeholder="Ex: Glúten, Lactose, Amendoim..."
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen transition-all font-bold min-h-[100px]"
                                                    value={newPatient.allergies}
                                                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <FileText size={12} className="text-blue-400" /> Histórico de Doenças / Observações
                                                </label>
                                                <textarea
                                                    placeholder="Ex: Diabetes Tipo 2, Hipertensão, Gastrite..."
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen transition-all font-bold min-h-[100px]"
                                                    value={newPatient.medical_history}
                                                    onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full bg-nutrigreen text-white py-5 rounded-[2rem] text-lg font-black shadow-xl shadow-nutrigreen/20 hover:scale-[1.02] active:scale-95 transition-all">
                                            Convidar e Salvar Ficha
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard label="Total de Pacientes" value={patients.length.toString()} icon={<Users className="text-nutrigreen" />} trend="+0%" />
                    <StatCard label="Consultas este mês" value="0" icon={<Calendar className="text-blue-500" />} trend="+0%" />
                    <StatCard label="Taxa de Adesão" value="0%" icon={<TrendingUp className="text-orange-500" />} trend="+0%" />
                </div>

                {/* Patients Table */}
                <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black mb-8 italic">Seus Pacientes</h3>
                    <div className="space-y-6">
                        {patients.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <Users className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-slate-400 font-bold">Você ainda não tem pacientes vinculados.</p>
                                <p className="text-slate-300 text-sm mt-2">Clique em "Novo Paciente" para começar.</p>
                            </div>
                        ) : (
                            patients
                                .filter(p => p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(patient => (
                                    <PatientRow
                                        key={patient.id}
                                        name={patient.full_name || "Sem nome"}
                                        date={new Date(patient.created_at).toLocaleDateString()}
                                        status="Ativo"
                                    />
                                ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function ModalInput({ label, placeholder, value, onChange, type = "text" }: any) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-nutrigreen/5 focus:bg-white focus:border-nutrigreen transition-all text-nutridark font-bold placeholder:text-slate-300"
            />
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
