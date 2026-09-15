import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listenCelulasLider } from '../services/celulaService';
import {
  fetchMembrosPorCelula,
  criarMembro,
  atualizarMembro,
  excluirMembro,
} from '../services/membroService';
import type { Celula } from '../types/celula';
import type { MembroCelula } from '../types/membro';
import {
  Users, UserPlus, ArrowLeft, Cake, Phone,
  MapPin, Edit2, Trash2, Power,
  Search, X, ClipboardCheck, MessageCircle,
} from 'lucide-react';

export default function MembrosGestao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [selectedCelulaId, setSelectedCelulaId] = useState<string>('');
  const [membros, setMembros] = useState<MembroCelula[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Formulário de Membro
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<MembroCelula | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formDataAniversario, setFormDataAniversario] = useState('');
  const [formEndereco, setFormEndereco] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

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

  // 2. Carregar membros quando celulaId mudar
  useEffect(() => {
    if (!selectedCelulaId) return;
    setLoadingMembros(true);
    fetchMembrosPorCelula(selectedCelulaId).then((data) => {
      setMembros(data);
      setLoadingMembros(false);
    });
  }, [selectedCelulaId]);

  const selectedCelula = useMemo(() => {
    return celulas.find(c => c.id === selectedCelulaId);
  }, [celulas, selectedCelulaId]);

  const handleSelectCelula = (id: string) => {
    setSelectedCelulaId(id);
    setSearchParams({ celulaId: id });
  };

  // Aniversariantes do mês atual
  const mesAtual = new Date().getMonth() + 1; // 1 a 12
  const isAniversarianteDoMes = (data: string) => {
    if (!data) return false;
    // Formatos aceitos: DD/MM/AAAA, DD/MM, YYYY-MM-DD
    if (data.includes('-')) {
      const parts = data.split('-');
      if (parts.length >= 2) return parseInt(parts[1], 10) === mesAtual;
    }
    if (data.includes('/')) {
      const parts = data.split('/');
      if (parts.length >= 2) return parseInt(parts[1], 10) === mesAtual;
    }
    return false;
  };

  // Filtragem de Membros
  const filteredMembros = useMemo(() => {
    if (!searchTerm.trim()) return membros;
    const term = searchTerm.toLowerCase();
    return membros.filter(m =>
      m.nome.toLowerCase().includes(term) ||
      m.whatsapp.includes(term) ||
      m.endereco.toLowerCase().includes(term)
    );
  }, [membros, searchTerm]);

  const aniversariantesMesCount = useMemo(() => {
    return membros.filter(m => isAniversarianteDoMes(m.dataAniversario)).length;
  }, [membros, mesAtual]);

  // Abertura do Modal de Adição/Edição
  const openNewModal = () => {
    setEditingMembro(null);
    setFormNome('');
    setFormDataAniversario('');
    setFormEndereco('');
    setFormWhatsapp('');
    setModalOpen(true);
  };

  const openEditModal = (m: MembroCelula) => {
    setEditingMembro(m);
    setFormNome(m.nome);
    setFormDataAniversario(m.dataAniversario);
    setFormEndereco(m.endereco);
    setFormWhatsapp(m.whatsapp);
    setModalOpen(true);
  };

  // Formatação de WhatsApp
  const handleWhatsappChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length > 7) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    setFormWhatsapp(formatted);
  };

  const handleSaveMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      alert('Por favor, informe o nome do membro.');
      return;
    }
    if (!formWhatsapp.trim()) {
      alert('Por favor, informe o WhatsApp do membro.');
      return;
    }
    if (!selectedCelulaId) {
      alert('Selecione uma célula para vincular o membro.');
      return;
    }

    try {
      setSaving(true);
      if (editingMembro) {
        await atualizarMembro(editingMembro.id, {
          nome: formNome.trim(),
          dataAniversario: formDataAniversario.trim(),
          endereco: formEndereco.trim(),
          whatsapp: formWhatsapp.trim(),
        });
        setMembros(prev => prev.map(m => m.id === editingMembro.id ? {
          ...m,
          nome: formNome.trim(),
          dataAniversario: formDataAniversario.trim(),
          endereco: formEndereco.trim(),
          whatsapp: formWhatsapp.trim(),
        } : m));
      } else {
        const novo = await criarMembro({
          celulaId: selectedCelulaId,
          nome: formNome.trim(),
          dataAniversario: formDataAniversario.trim(),
          endereco: formEndereco.trim(),
          whatsapp: formWhatsapp.trim(),
          ativo: true,
        });
        setMembros(prev => [...prev, novo]);
      }
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar membro. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (m: MembroCelula) => {
    try {
      const novoStatus = !m.ativo;
      await atualizarMembro(m.id, { ativo: novoStatus });
      setMembros(prev => prev.map(item => item.id === m.id ? { ...item, ativo: novoStatus } : item));
    } catch (err) {
      alert('Erro ao alterar status do membro.');
    }
  };

  const handleDeleteMembro = async (m: MembroCelula) => {
    if (confirm(`Deseja realmente excluir o membro "${m.nome}"?`)) {
      try {
        await excluirMembro(m.id);
        setMembros(prev => prev.filter(item => item.id !== m.id));
      } catch (err) {
        alert('Erro ao excluir membro.');
      }
    }
  };

  const formatCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-12">
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
                <Users className="w-4 h-4 text-brand-400" />
                Membros da Célula
              </h1>
              <p className="text-[11px] text-slate-400">
                {selectedCelula ? `${selectedCelula.nome} (${selectedCelula.perfil})` : 'Cadastro, aniversários e gestão de membros'}
              </p>
            </div>
          </div>

          {selectedCelulaId && (
            <Link
              to={`/lider/chamada?celulaId=${selectedCelulaId}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Fazer Chamada</span>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : celulas.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-3xl">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white">Nenhuma célula vinculada</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Cadastre sua primeira célula no painel para poder gerenciar membros.
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
            {/* Seletor de Célula (se houver mais de 1) */}
            {celulas.length > 1 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Selecione a Célula:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {celulas.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCelula(c.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedCelulaId === c.id
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {c.nome} ({c.perfil})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Banner com Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Membros Cadastrados</div>
                <div className="text-2xl font-black text-white mt-1">{membros.length}</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                  <Cake className="w-3.5 h-3.5" /> Aniversários (Mês)
                </div>
                <div className="text-2xl font-black text-rose-400 mt-1">{aniversariantesMesCount}</div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center">
                <button
                  onClick={openNewModal}
                  className="w-full h-full min-h-[64px] flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Membro</span>
                </button>
              </div>
            </div>

            {/* Barra de Busca de Membros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar membro por nome, WhatsApp ou endereço..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Listagem de Membros */}
            {loadingMembros ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMembros.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-3xl">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">
                  {searchTerm ? 'Nenhum membro encontrado com este termo' : 'Nenhum membro cadastrado nesta célula'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto">
                  {searchTerm
                    ? 'Tente outra busca ou limpe o campo de pesquisa.'
                    : 'Cadastre os membros da sua célula para registrar frequências, pontualidade e datas de aniversário.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openNewModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Adicionar Primeiro Membro
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredMembros.map((m) => {
                  const isAniver = isAniversarianteDoMes(m.dataAniversario);
                  const cleanPhone = formatCleanPhone(m.whatsapp);

                  return (
                    <div
                      key={m.id}
                      className={`bg-white/5 border rounded-2xl p-4 space-y-3 transition-all ${
                        isAniver
                          ? 'border-rose-500/40 bg-rose-500/5 shadow-sm shadow-rose-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-md">
                            {m.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{m.nome}</h4>
                              {!m.ativo && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  Inativo
                                </span>
                              )}
                            </div>
                            {isAniver && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-400 mt-0.5">
                                <Cake className="w-3 h-3" /> Aniversariante do Mês!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAtivo(m)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              m.ativo
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-slate-800 border-white/10 text-slate-500 hover:text-slate-300'
                            }`}
                            title={m.ativo ? 'Membro Ativo (clique para desativar)' : 'Membro Inativo (clique para ativar)'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar Membro"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMembro(m)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Excluir Membro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Informações detalhadas */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {m.dataAniversario && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Cake className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span>Aniversário: <strong className="text-white">{m.dataAniversario}</strong></span>
                          </div>
                        )}

                        {m.endereco && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                            <span className="truncate">{m.endereco}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{m.whatsapp}</span>
                          </div>

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(m.nome)}!%20Gra%C3%A7a%20e%20Paz!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Adicionar / Editar Membro */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-400" />
                {editingMembro ? 'Editar Membro' : 'Cadastrar Novo Membro'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMembro} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5 text-rose-400" /> Aniversário
                  </label>
                  <input
                    type="text"
                    value={formDataAniversario}
                    onChange={(e) => setFormDataAniversario(e.target.value)}
                    placeholder="Ex: 15/05 ou 15/05/1990"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formWhatsapp}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" /> Endereço
                </label>
                <input
                  type="text"
                  value={formEndereco}
                  onChange={(e) => setFormEndereco(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingMembro ? 'Atualizar Membro' : 'Salvar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
