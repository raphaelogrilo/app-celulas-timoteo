import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listenCelulasLider } from '../services/celulaService';
import { fetchMembrosPorCelula, fetchChamadasPorCelula, salvarChamada, excluirChamada } from '../services/membroService';
import type { Celula } from '../types/celula';
import type {
  MembroCelula,
  PresencaMembro,
  VisitanteChamada,
  ChamadaCelula,
  PontualidadeMinutos,
} from '../types/membro';
import { OPCOES_PONTUALIDADE } from '../types/membro';
import {
  ClipboardCheck, ArrowLeft, Calendar, Users,
  UserPlus, UserCheck, UserX, Clock, Phone,
  PlusCircle, Trash2, CheckCircle2, History,
  Save, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

export default function ChamadaEncontro() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [selectedCelulaId, setSelectedCelulaId] = useState<string>('');
  const [membros, setMembros] = useState<MembroCelula[]>([]);
  const [chamadasHistorico, setChamadasHistorico] = useState<ChamadaCelula[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDados, setLoadingDados] = useState(false);
  const [activeTab, setActiveTab] = useState<'nova' | 'historico'>('nova');

  // Formulário de Chamada Atual
  const hojeIso = new Date().toISOString().split('T')[0];
  const [dataEncontro, setDataEncontro] = useState<string>(hojeIso);
  const [tema, setTema] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  // Presenças dos Membros
  const [presencas, setPresencas] = useState<PresencaMembro[]>([]);

  // Visitantes da Reunião
  const [visitantes, setVisitantes] = useState<VisitanteChamada[]>([]);

  // Modal / Linha de Adicionar Visitante
  const [visNome, setVisNome] = useState('');
  const [visWhatsapp, setVisWhatsapp] = useState('');
  const [visConvidadoPor, setVisConvidadoPor] = useState('');
  const [visPontualidade, setVisPontualidade] = useState<PontualidadeMinutos>(0);
  const [visObservacao, setVisObservacao] = useState('');

  const [saving, setSaving] = useState(false);
  const [expandedChamadaId, setExpandedChamadaId] = useState<string | null>(null);

  const urlCelulaId = searchParams.get('celulaId');

  // 1. Carregar células do líder
  useEffect(() => {
    if (!currentUser?.email && !currentUser?.id) return;
    const identifier = currentUser.email || currentUser.id;

    const unsub = listenCelulasLider(identifier, (data) => {
      setCelulas(data);
      if (data.length > 0) {
        if (urlCelulaId && data.some(c => c.id === urlCelulaId)) {
          setSelectedCelulaId(urlCelulaId);
        } else if (!selectedCelulaId) {
          setSelectedCelulaId(data[0].id);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, urlCelulaId]);

  // 2. Carregar membros e histórico ao selecionar célula
  useEffect(() => {
    if (!selectedCelulaId) return;
    setLoadingDados(true);

    Promise.all([
      fetchMembrosPorCelula(selectedCelulaId),
      fetchChamadasPorCelula(selectedCelulaId),
    ]).then(([membrosData, chamadasData]) => {
      setMembros(membrosData);
      setChamadasHistorico(chamadasData);

      // Inicializa lista de presenças com os membros ativos
      const initialPresencas: PresencaMembro[] = membrosData
        .filter(m => m.ativo)
        .map(m => ({
          membroId: m.id,
          nome: m.nome,
          whatsapp: m.whatsapp,
          presente: true, // Padrão como presente para agilizar
          pontualidadeMinutos: 0, // Pontual por padrão
          observacao: '',
        }));

      setPresencas(initialPresencas);
      setLoadingDados(false);
    });
  }, [selectedCelulaId]);

  const selectedCelula = useMemo(() => {
    return celulas.find(c => c.id === selectedCelulaId);
  }, [celulas, selectedCelulaId]);

  const handleSelectCelula = (id: string) => {
    setSelectedCelulaId(id);
    setSearchParams({ celulaId: id });
  };

  // Alternar presença do membro
  const handleTogglePresenca = (membroId: string) => {
    setPresencas(prev =>
      prev.map(p => {
        if (p.membroId === membroId) {
          return { ...p, presente: !p.presente };
        }
        return p;
      })
    );
  };

  // Alterar pontualidade do membro
  const handleChangePontualidade = (membroId: string, minutos: PontualidadeMinutos) => {
    setPresencas(prev =>
      prev.map(p => {
        if (p.membroId === membroId) {
          return { ...p, pontualidadeMinutos: minutos };
        }
        return p;
      })
    );
  };

  // Alterar observação do membro
  const handleChangeObservacao = (membroId: string, obs: string) => {
    setPresencas(prev =>
      prev.map(p => {
        if (p.membroId === membroId) {
          return { ...p, observacao: obs };
        }
        return p;
      })
    );
  };

  // Marcar todos como presentes / ausentes
  const handleMarcarTodos = (status: boolean) => {
    setPresencas(prev => prev.map(p => ({ ...p, presente: status })));
  };

  // Máscara WhatsApp Visitante
  const handleVisWhatsappChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length > 7) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    setVisWhatsapp(formatted);
  };

  // Adicionar Visitante
  const handleAddVisitante = () => {
    if (!visNome.trim()) {
      alert('Por favor, informe o nome do visitante.');
      return;
    }
    if (!visWhatsapp.trim()) {
      alert('Por favor, informe o WhatsApp do visitante.');
      return;
    }

    const convidadoPorObj = membros.find(m => m.id === visConvidadoPor);

    const novoVisitante: VisitanteChamada = {
      id: 'vis_' + Date.now(),
      nome: visNome.trim(),
      whatsapp: visWhatsapp.trim(),
      convidadoPorMembroId: visConvidadoPor || undefined,
      convidadoPorNome: convidadoPorObj ? convidadoPorObj.nome : visConvidadoPor || 'Iniciativa própria / Outro',
      pontualidadeMinutos: visPontualidade,
      observacao: visObservacao.trim() || undefined,
    };

    setVisitantes(prev => [...prev, novoVisitante]);
    setVisNome('');
    setVisWhatsapp('');
    setVisConvidadoPor('');
    setVisPontualidade(0);
    setVisObservacao('');
  };

  const handleRemoveVisitante = (id: string) => {
    setVisitantes(prev => prev.filter(v => v.id !== id));
  };

  // Contadores em tempo real
  const presentesCount = useMemo(() => presencas.filter(p => p.presente).length, [presencas]);
  const faltasCount = useMemo(() => presencas.filter(p => !p.presente).length, [presencas]);
  const visitantesCount = visitantes.length;
  const totalGeral = presentesCount + visitantesCount;

  // Salvar Chamada
  const handleSalvarChamada = async () => {
    if (!selectedCelulaId) {
      alert('Selecione uma célula para salvar a chamada.');
      return;
    }
    if (!dataEncontro) {
      alert('Por favor, defina a data do encontro.');
      return;
    }

    try {
      setSaving(true);
      const salva = await salvarChamada({
        celulaId: selectedCelulaId,
        dataEncontro,
        tema: tema.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        presencas,
        visitantes,
        totalPresentes: presentesCount,
        totalFaltas: faltasCount,
        totalVisitantes: visitantesCount,
      });

      setChamadasHistorico(prev => [salva, ...prev.filter(c => c.id !== salva.id)]);
      alert('✅ Chamada salva com sucesso!');
      setActiveTab('historico');
    } catch (err) {
      alert('Erro ao salvar chamada. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistorico = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de chamada?')) {
      try {
        await excluirChamada(id);
        setChamadasHistorico(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Erro ao excluir histórico de chamada.');
      }
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-16">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/lider/dashboard')}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                Chamada e Frequência do Encontro
              </h1>
              <p className="text-[11px] text-slate-400">
                {selectedCelula ? `${selectedCelula.nome} (${selectedCelula.perfil})` : 'Registro de presença'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/lider/membros?celulaId=${selectedCelulaId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Gerenciar Membros</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : celulas.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-3xl">
            <ClipboardCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white">Nenhuma célula encontrada</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Você precisa de pelo menos uma célula cadastrada para realizar chamadas.
            </p>
            <Link
              to="/lider/cadastro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Cadastrar Célula
            </Link>
          </div>
        ) : (
          <>
            {/* Seletor de Células */}
            {celulas.length > 1 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Célula Atual:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {celulas.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCelula(c.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedCelulaId === c.id
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {c.nome} ({c.perfil})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternador de Abas: Fazer Chamada vs Histórico */}
            <div className="flex rounded-2xl bg-slate-900 border border-white/10 p-1">
              <button
                onClick={() => setActiveTab('nova')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'nova'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                Nova Chamada
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'historico'
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                Histórico ({chamadasHistorico.length})
              </button>
            </div>

            {loadingDados ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ABA: NOVA CHAMADA */}
                {activeTab === 'nova' && (
              <div className="space-y-6">
                {/* Cabeçalho da Reunião (Data, Tema e Observações) */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    Dados do Encontro
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Data da Reunião *
                      </label>
                      <input
                        type="date"
                        required
                        value={dataEncontro}
                        onChange={(e) => setDataEncontro(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Tema / Palavra Ministrada (Opcional)
                      </label>
                      <input
                        type="text"
                        value={tema}
                        onChange={(e) => setTema(e.target.value)}
                        placeholder="Ex: O Poder da Oração, Fruto do Espírito..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dashboard de Presença em Tempo Real */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Membros Presentes
                    </div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{presentesCount}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <div className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" /> Faltas
                    </div>
                    <div className="text-2xl font-black text-rose-400 mt-1">{faltasCount}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Visitantes
                    </div>
                    <div className="text-2xl font-black text-amber-400 mt-1">{visitantesCount}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                    <div className="text-[11px] font-bold text-brand-400 uppercase flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Total Geral
                    </div>
                    <div className="text-2xl font-black text-white mt-1">{totalGeral}</div>
                  </div>
                </div>

                {/* SEÇÃO 1: MEMBROS CADASTRADOS (CHAMADA E PONTUALIDADE) */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Chamada dos Membros Cadastrados ({presencas.length})
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Marque presença/ausência e o nível de pontualidade (de 5 em 5 min)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarcarTodos(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Todos Presentes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarcarTodos(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {presencas.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-300 font-bold">Nenhum membro ativo cadastrado nesta célula</p>
                      <p className="text-[11px] text-slate-500 mt-1 mb-3">
                        Cadastre os membros da sua célula para poder registrar a pontualidade.
                      </p>
                      <Link
                        to={`/lider/membros?celulaId=${selectedCelulaId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Cadastrar Membros
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {presencas.map((p) => {
                        return (
                          <div
                            key={p.membroId}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              p.presente
                                ? 'bg-slate-900/90 border-emerald-500/30 shadow-sm'
                                : 'bg-slate-950/60 border-white/5 opacity-70'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Nome e Toggle de Presença */}
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePresenca(p.membroId)}
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                    p.presente
                                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  }`}
                                  title={p.presente ? 'Marcar como ausente' : 'Marcar como presente'}
                                >
                                  {p.presente ? <CheckCircle2 className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                </button>

                                <div>
                                  <div className="text-sm font-bold text-white flex items-center gap-2">
                                    {p.nome}
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        p.presente
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      }`}
                                    >
                                      {p.presente ? 'Presente' : 'Ausente'}
                                    </span>
                                  </div>
                                  {p.whatsapp && (
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 text-emerald-400" />
                                      {p.whatsapp}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Seletor de Pontualidade (5 em 5 minutos) */}
                              {p.presente && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                    <Clock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                    <span className="font-bold text-[11px] text-slate-400">Pontualidade:</span>
                                  </div>

                                  <select
                                    value={p.pontualidadeMinutos}
                                    onChange={(e) =>
                                      handleChangePontualidade(
                                        p.membroId,
                                        Number(e.target.value) as PontualidadeMinutos
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                                  >
                                    {OPCOES_PONTUALIDADE.map((opt) => (
                                      <option key={opt.valor} value={opt.valor} className="bg-slate-900 text-white">
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Observação / Motivo de Falta */}
                            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-2">
                              <input
                                type="text"
                                value={p.observacao || ''}
                                onChange={(e) => handleChangeObservacao(p.membroId, e.target.value)}
                                placeholder={
                                  p.presente
                                    ? 'Observação sobre o membro (opcional)...'
                                    : 'Motivo da ausência / pedido de oração (opcional)...'
                                }
                                className="w-full px-3 py-1 rounded-lg bg-slate-950/60 border border-white/10 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SEÇÃO 2: VISITANTES (NÃO CADASTRADOS COMO MEMBROS) */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Visitantes do Encontro ({visitantes.length})
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Registre pessoas que vieram visitar a célula, o WhatsApp e qual membro as convidou
                    </p>
                  </div>

                  {/* Formulário de Adição Rápida de Visitante */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      Adicionar Novo Visitante
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Nome do Visitante *
                        </label>
                        <input
                          type="text"
                          value={visNome}
                          onChange={(e) => setVisNome(e.target.value)}
                          placeholder="Ex: Carlos Eduardo"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          WhatsApp do Visitante *
                        </label>
                        <input
                          type="tel"
                          value={visWhatsapp}
                          onChange={(e) => handleVisWhatsappChange(e.target.value)}
                          placeholder="(31) 99999-9999"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Qual membro convidou?
                        </label>
                        <select
                          value={visConvidadoPor}
                          onChange={(e) => setVisConvidadoPor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="">Selecione o membro que convidou</option>
                          {membros.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nome}
                            </option>
                          ))}
                          <option value="Iniciativa própria">Iniciativa Própria / Redes Sociais</option>
                          <option value="Líder">Líder da Célula</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Pontualidade / Chegada
                        </label>
                        <select
                          value={visPontualidade}
                          onChange={(e) => setVisPontualidade(Number(e.target.value) as PontualidadeMinutos)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          {OPCOES_PONTUALIDADE.map((opt) => (
                            <option key={opt.valor} value={opt.valor}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVisitante}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Incluir Visitante na Chamada
                    </button>
                  </div>

                  {/* Lista de Visitantes Adicionados */}
                  {visitantes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Visitantes Registrados neste Encontro ({visitantes.length})
                      </div>

                      {visitantes.map((v) => {
                        const opt = OPCOES_PONTUALIDADE.find(o => o.valor === v.pontualidadeMinutos);

                        return (
                          <div
                            key={v.id}
                            className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm">{v.nome}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Visitante
                                </span>
                                {opt && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.badgeColor}`}>
                                    {opt.label}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  {v.whatsapp}
                                </span>
                                {v.convidadoPorNome && (
                                  <span className="text-slate-400">
                                    Convidado por: <strong className="text-white">{v.convidadoPorNome}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVisitante(v.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer self-end sm:self-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sm:hidden">Remover</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Observações Gerais */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Observações / Relato do Encontro (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Reunião muito abençoada, comunhão calorosa, decidimos novo local para a próxima semana..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Botão de Ação Salvar Chamada */}
                <div className="sticky bottom-4 z-20">
                  <button
                    type="button"
                    onClick={handleSalvarChamada}
                    disabled={saving}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-2xl shadow-emerald-600/40 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Salvando Chamada...' : 'Finalizar e Salvar Chamada do Encontro'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ABA: HISTÓRICO DE CHAMADAS */}
            {activeTab === 'historico' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Histórico de Chamadas Realizadas ({chamadasHistorico.length})
                  </h3>
                </div>

                {chamadasHistorico.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-3xl">
                    <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white">Nenhuma chamada registrada anteriormente</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-5">
                      Alterne para a aba "Nova Chamada" para fazer o primeiro registro deste grupo.
                    </p>
                    <button
                      onClick={() => setActiveTab('nova')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Fazer Nova Chamada
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {chamadasHistorico.map((c) => {
                      const isExpanded = expandedChamadaId === c.id;

                      return (
                        <div
                          key={c.id}
                          className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-base text-white">
                                  Encontro de {new Date(c.dataEncontro + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </span>
                                {c.tema && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                                    {c.tema}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                                <span className="text-emerald-400 font-bold">
                                  ✓ {c.totalPresentes} Membros presentes
                                </span>
                                <span className="text-rose-400 font-bold">
                                  ✗ {c.totalFaltas} Faltas
                                </span>
                                <span className="text-amber-400 font-bold">
                                  ★ {c.totalVisitantes} Visitantes
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedChamadaId(isExpanded ? null : c.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title={isExpanded ? 'Recolher detalhes' : 'Ver detalhes completos'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteHistorico(c.id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                title="Excluir Registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Detalhes expandidos */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-white/10 space-y-4 animate-in fade-in duration-150">
                              {/* Lista de Membros */}
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Membros ({c.presencas?.length || 0})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {c.presencas?.map((p, idx) => {
                                    const opt = OPCOES_PONTUALIDADE.find(o => o.valor === p.pontualidadeMinutos);

                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                          p.presente
                                            ? 'bg-slate-900 border-emerald-500/20 text-white'
                                            : 'bg-slate-950 border-rose-500/20 text-slate-400'
                                        }`}
                                      >
                                        <span className="font-bold">{p.nome}</span>
                                        <div className="flex items-center gap-1.5">
                                          {p.presente ? (
                                            opt && (
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${opt.badgeColor}`}>
                                                {opt.label}
                                              </span>
                                            )
                                          ) : (
                                            <span className="text-[10px] font-bold text-rose-400">Ausente</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Lista de Visitantes */}
                              {c.visitantes && c.visitantes.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                                    Visitantes ({c.visitantes.length})
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {c.visitantes.map((v, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-white">{v.nome}</span>
                                          <span className="text-[10px] font-bold text-amber-400">{v.whatsapp}</span>
                                        </div>
                                        {v.convidadoPorNome && (
                                          <div className="text-[10px] text-slate-400">
                                            Convidado por: <strong className="text-slate-200">{v.convidadoPorNome}</strong>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {c.observacoes && (
                                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300">
                                  <strong className="text-white block mb-0.5">Observações:</strong>
                                  {c.observacoes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
