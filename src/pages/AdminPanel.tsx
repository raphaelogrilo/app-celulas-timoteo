import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllLideres, createLider, deleteLider } from '../services/authService';
import { listenAllCelulasAdmin, toggleCelulaAtivo, deleteCelula, resetAndSeedOfficialCelulas } from '../services/celulaService';
import type { LiderUser, Celula } from '../types/celula';
import { getProfileStyle } from '../utils/geo';
import {
  Users, Plus, Trash2, Power, PowerOff, Loader2, AlertCircle,
  ArrowLeft, Shield, MapPin, ChevronDown, ChevronUp, CheckCircle,
  Edit3, RefreshCw, Search, LogOut, Navigation, CheckCircle2,
  Calendar, Phone, Mail, Compass, Sparkles,
} from 'lucide-react';

const newLiderSchema = z.object({
  email: z.string().email('E-mail Google válido é obrigatório'),
  nome: z.string().min(3, 'Informe o nome completo do líder'),
  isAdmin: z.boolean().default(false),
});

type NewLiderForm = z.infer<typeof newLiderSchema>;

export default function AdminPanel() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [lideres, setLideres] = useState<LiderUser[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filtros de busca no painel
  const [cellSearch, setCellSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'itinerante'>('all');
  const [leaderSearch, setLeaderSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewLiderForm>({
    resolver: zodResolver(newLiderSchema) as any,
    defaultValues: { isAdmin: false },
  });

  // Redireciona se não for admin
  useEffect(() => {
    if (!isAdmin) navigate('/lider/dashboard');
  }, [isAdmin, navigate]);

  // Carrega dados iniciais
  useEffect(() => {
    getAllLideres().then((data) => {
      setLideres(data);
      setLoadingData(false);
    });

    const unsub = listenAllCelulasAdmin((data) => setCelulas(data));
    return () => unsub();
  }, []);

  const onCreateLider = async (data: NewLiderForm) => {
    setSubmitError(null);
    setSubmitMsg(null);
    try {
      await createLider(data.email, data.nome, data.isAdmin);
      setSubmitMsg(
        `Líder "${data.nome}" autorizado! Ele já pode fazer login no app com o Google usando o e-mail ${data.email}.`
      );
      reset();
      setShowForm(false);
      const updated = await getAllLideres();
      setLideres(updated);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Erro ao autorizar líder.');
    }
  };

  const onDeleteLider = async (id: string, nome: string) => {
    if (!confirm(`Revogar autorização de acesso do líder "${nome}"?`)) return;
    try {
      await deleteLider(id);
      setLideres(lideres.filter((l) => l.id !== id && l.uid !== id));
      setSubmitMsg(`Autorização de "${nome}" revogada.`);
    } catch (err: any) {
      alert(`Erro ao remover líder: ${err?.message}`);
    }
  };

  const handleResetOfficialCells = async () => {
    if (!confirm('Deseja realmente resetar todas as células do app e carregar as 13 células oficiais do cronograma com localização precisa?')) {
      return;
    }
    try {
      setResetting(true);
      await resetAndSeedOfficialCelulas();
      setSubmitMsg('✅ Banco de dados atualizado com sucesso com as 13 Células Oficiais da Igreja Atos!');
    } catch (err: any) {
      alert('Erro ao resetar células: ' + err?.message);
    } finally {
      setResetting(false);
    }
  };

  // Células filtradas
  const filteredCelulas = useMemo(() => {
    return celulas.filter((c) => {
      if (statusFilter === 'active' && !c.ativo) return false;
      if (statusFilter === 'inactive' && c.ativo) return false;
      if (statusFilter === 'itinerante' && !c.itinerante) return false;

      if (cellSearch.trim()) {
        const q = cellSearch.toLowerCase().trim();
        const bairro = (c.itinerante ? c.encontroAtual?.bairro : c.bairro) || '';
        return (
          c.nome.toLowerCase().includes(q) ||
          c.lider.toLowerCase().includes(q) ||
          bairro.toLowerCase().includes(q) ||
          (c.perfil || '').toLowerCase().includes(q) ||
          (c.liderEmail || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [celulas, statusFilter, cellSearch]);

  // Líderes filtrados
  const filteredLideres = useMemo(() => {
    if (!leaderSearch.trim()) return lideres;
    const q = leaderSearch.toLowerCase().trim();
    return lideres.filter(
      (l) => l.nome.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    );
  }, [lideres, leaderSearch]);

  // Métricas do Dashboard
  const totalCelulas = celulas.length;
  const ativasCount = celulas.filter((c) => c.ativo).length;
  const itinerantesCount = celulas.filter((c) => c.itinerante).length;
  const totalLideres = lideres.length;

  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;
  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Header Responsivo */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/lider/dashboard')}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Voltar ao Painel do Líder"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                  Painel Geral Admin
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAAB36]/20 text-[#FAAB36] border border-[#FAAB36]/30 uppercase">
                    Igreja Atos
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Controle total de células, líderes autorizados e permissões
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Mapa Público
            </Link>
            <Link
              to="/lider/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              Painel Líder
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs font-medium">Carregando painel administrativo...</p>
          </div>
        ) : (
          <>
            {/* Feedback Message */}
            {submitMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{submitMsg}</span>
                </div>
                <button
                  onClick={() => setSubmitMsg(null)}
                  className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* KPI Summary Cards (Desktop 4 col / Mobile 2 col) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Total Células</div>
                  <div className="text-xl lg:text-2xl font-black text-white">{totalCelulas}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Ativas no Mapa</div>
                  <div className="text-xl lg:text-2xl font-black text-emerald-400">{ativasCount}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Itinerantes</div>
                  <div className="text-xl lg:text-2xl font-black text-amber-400">{itinerantesCount}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Líderes Autorizados</div>
                  <div className="text-xl lg:text-2xl font-black text-white">{totalLideres}</div>
                </div>
              </div>
            </div>

            {/* Split Screen Layout on Desktop: Left Column (Líderes) / Right Column (Células) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* ===== COLUNA 1: LÍDERES AUTORIZADOS (4 colunas no Desktop) ===== */}
              <section className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-400" />
                    Líderes Autorizados ({lideres.length})
                  </h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Autorizar
                    {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Form Autorizar Novo Líder */}
                {showForm && (
                  <form
                    onSubmit={handleSubmit(onCreateLider as any)}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-brand-500/30 space-y-3 animate-fadeIn"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">
                      Autorizar Acesso Google
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      O líder poderá entrar imediatamente com o e-mail Google informado.
                    </p>

                    <div>
                      <label className={LABEL_CLASS}>Nome Completo</label>
                      <input
                        {...register('nome')}
                        className={FIELD_CLASS}
                        placeholder="Ex: Lucas Ribeiro"
                      />
                      {errors.nome && (
                        <p className={ERROR_CLASS}>
                          <AlertCircle className="w-3 h-3" />
                          {errors.nome.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>E-mail Google</label>
                      <input
                        {...register('email')}
                        type="email"
                        className={FIELD_CLASS}
                        placeholder="lider@gmail.com"
                      />
                      {errors.email && (
                        <p className={ERROR_CLASS}>
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        {...register('isAdmin')}
                        type="checkbox"
                        className="w-4 h-4 rounded accent-brand-500"
                      />
                      <span className="text-xs text-slate-300">Conceder poderes de Admin</span>
                    </label>

                    {submitError && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                        </>
                      ) : (
                        'Salvar Autorização'
                      )}
                    </button>
                  </form>
                )}

                {/* Busca rápida de líderes */}
                {lideres.length > 3 && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={leaderSearch}
                      onChange={(e) => setLeaderSearch(e.target.value)}
                      placeholder="Filtrar líderes..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                {/* Lista de Líderes */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
                  {filteredLideres.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                      Nenhum líder encontrado.
                    </div>
                  ) : (
                    filteredLideres.map((l) => (
                      <div
                        key={l.id || l.uid}
                        className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-white/10 flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{l.nome}</span>
                            {l.isAdmin && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase flex-shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {l.email}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            {l.userId ? (
                              <span className="text-emerald-400 font-medium">✓ Google conectado</span>
                            ) : (
                              <span className="text-amber-400/80">Aguardando 1º login</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteLider(l.id || l.uid || '', l.nome)}
                          title="Revogar autorização do líder"
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* ===== COLUNA 2: TODAS AS CÉLULAS (8 colunas no Desktop) ===== */}
              <section className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-5 lg:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      Todas as Células ({filteredCelulas.length})
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Edite, ative, inative ou atualize qualquer célula da cidade
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleResetOfficialCells}
                      disabled={resetting}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Apaga os dados antigos e carrega as 13 células oficiais com localização exata"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{resetting ? 'Carregando...' : 'Carregar 13 Células Oficiais'}</span>
                    </button>

                    <Link
                      to="/lider/cadastro"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Nova Célula
                    </Link>
                  </div>
                </div>

                {/* Filtros e Busca de Células */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={cellSearch}
                      onChange={(e) => setCellSearch(e.target.value)}
                      placeholder="Buscar por nome, líder, bairro ou perfil..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: 'all', label: 'Todas' },
                      { id: 'active', label: 'Ativas' },
                      { id: 'inactive', label: 'Inativas' },
                      { id: 'itinerante', label: 'Itinerantes' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setStatusFilter(btn.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                          statusFilter === btn.id
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Responsivo de Cards de Células */}
                {filteredCelulas.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
                    Nenhuma célula encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCelulas.map((c) => {
                      const pStyle = getProfileStyle(c.perfil);
                      const dia = c.itinerante ? c.encontroAtual?.dia : c.dia;
                      const horario = c.itinerante ? c.encontroAtual?.horario : c.horario;
                      const bairro = c.itinerante ? c.encontroAtual?.bairro : c.bairro;

                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            c.ativo
                              ? 'bg-slate-900/60 hover:bg-slate-900/90 border-white/10'
                              : 'bg-red-950/20 border-red-900/30 opacity-80'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${pStyle.badgeBg} ${pStyle.badgeText}`}>
                                    {c.perfil}
                                  </span>
                                  {c.itinerante && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                                      🚶 Itinerante
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      c.ativo
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}
                                  >
                                    {c.ativo ? '● Ativa' : '● Inativa'}
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-white mt-1.5">{c.nome}</h3>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>
                                  Líder: <strong className="text-white">{c.lider}</strong>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>{c.telefone}</span>
                              </div>

                              {c.liderEmail && (
                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
                                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{c.liderEmail}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 text-slate-300">
                                <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                <span>Bairro {bairro || 'Não informado'}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>
                                  {dia || 'Dia não definido'} às {horario || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Toolbar de Ações do Card */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              {/* Editar Célula Completa */}
                              <Link
                                to={`/lider/editar?id=${c.id}`}
                                title="Editar todos os dados"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Editar</span>
                              </Link>

                              {/* Atualizar Semana (se itinerante) */}
                              {c.itinerante && (
                                <Link
                                  to={`/lider/itinerante?id=${c.id}`}
                                  title="Atualizar endereço da semana"
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Semana</span>
                                </Link>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Ativar / Inativar */}
                              <button
                                onClick={() => toggleCelulaAtivo(c.id, !c.ativo)}
                                title={c.ativo ? 'Inativar célula (ocultar do mapa)' : 'Ativar célula (exibir no mapa)'}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                  c.ativo
                                    ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                    : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                }`}
                              >
                                {c.ativo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                              </button>

                              {/* Excluir Permanentemente */}
                              <button
                                onClick={async () => {
                                  if (confirm(`Excluir permanentemente a célula "${c.nome}"?`)) {
                                    await deleteCelula(c.id);
                                  }
                                }}
                                title="Excluir permanentemente"
                                className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
