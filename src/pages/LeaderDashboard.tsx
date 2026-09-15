import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  listenCelulasLider,
  toggleCelulaAtivo,
} from '../services/celulaService';
import type { Celula } from '../types/celula';
import { getProfileStyle } from '../utils/geo';
import {
  LogOut, MapPin, Calendar, Phone, Edit3,
  RefreshCw, PlusCircle, Compass,
  Users, Navigation, Search, Power,
  ClipboardCheck,
} from 'lucide-react';

export default function LeaderDashboard() {
  const { currentUser, liderData, logout } = useAuth();
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.email && !currentUser?.id) return;
    const identifier = currentUser.email || currentUser.id;

    // Escuta em tempo real todas as células deste líder
    const unsub = listenCelulasLider(identifier, (data) => {
      setCelulas(data);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleToggleStatus = async (c: Celula) => {
    try {
      setTogglingId(c.id);
      await toggleCelulaAtivo(c.id, !c.ativo);
      setCelulas(prev => prev.map(item => item.id === c.id ? { ...item, ativo: !item.ativo } : item));
    } catch (err) {
      alert('Erro ao alterar status da célula.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredCelulas = useMemo(() => {
    if (!searchTerm.trim()) return celulas;
    const s = searchTerm.toLowerCase();
    return celulas.filter(c =>
      c.nome.toLowerCase().includes(s) ||
      c.perfil.toLowerCase().includes(s) ||
      (c.bairro && c.bairro.toLowerCase().includes(s))
    );
  }, [celulas, searchTerm]);

  const totalCelulas = celulas.length;
  const ativasCount = celulas.filter(c => c.ativo).length;
  const itinerantesCount = celulas.filter(c => c.itinerante).length;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Header Responsivo */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Painel do Líder
                {liderData?.isAdmin && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-sm">
                {liderData?.nome || currentUser?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-bold border border-brand-500/30 transition-all active:scale-95"
              title="Ver Mapa Público"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-400" />
              <span>Ver Mapa</span>
            </Link>
            {liderData?.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
              >
                Painel Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">

        {/* Estatísticas e Ações Rápidas do Topo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Minhas Células</div>
            <div className="text-2xl lg:text-3xl font-black text-white mt-1">{totalCelulas}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Células Ativas</div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-400 mt-1">{ativasCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Itinerantes</div>
            <div className="text-2xl lg:text-3xl font-black text-amber-400 mt-1">{itinerantesCount}</div>
          </div>
          <div className="flex items-center">
            <Link
              to="/lider/cadastro"
              className="w-full h-full min-h-[72px] flex items-center justify-center gap-2 p-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Célula</span>
            </Link>
          </div>
        </div>

        {/* Barra de Busca de Células */}
        {totalCelulas > 1 && (
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar entre minhas células por nome, perfil ou bairro..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCelulas.length === 0 ? (
          /* Sem células */
          <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {searchTerm ? 'Nenhuma célula encontrada para a busca' : 'Nenhuma célula cadastrada sob sua liderança'}
            </h2>
            <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
              {searchTerm
                ? 'Tente buscar com outro termo ou limpe o campo de busca.'
                : 'Cadastre sua primeira célula para que os visitantes e membros de Timóteo possam localizá-la.'}
            </p>
            {!searchTerm && (
              <Link
                to="/lider/cadastro"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar Célula
              </Link>
            )}
          </div>
        ) : (
          /* Lista de Células do Líder */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gerenciar Células Cadastradas ({filteredCelulas.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCelulas.map((c) => {
                const style = getProfileStyle(c.perfil);
                const dia = c.itinerante ? c.encontroAtual?.dia : c.dia;
                const horario = c.itinerante ? c.encontroAtual?.horario : c.horario;
                const bairro = c.itinerante ? c.encontroAtual?.bairro : c.bairro;
                const totalLocais = c.locaisItinerantes?.length || c.encontroAtual?.locais?.length || 0;

                return (
                  <div
                    key={c.id}
                    className="bg-white/5 border border-white/10 hover:border-white/20 rounded-3xl p-5 md:p-6 space-y-4 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Topo do Card: Perfil, Status e Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${style.badgeBg} ${style.badgeText}`}>
                            {c.perfil}
                          </span>
                          {c.itinerante && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                              ⚡ Itinerante {totalLocais > 0 ? `(${totalLocais} locais)` : ''}
                            </span>
                          )}
                        </div>

                        {/* Botão de Ativar / Pausar */}
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={togglingId === c.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            c.ativo
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                          }`}
                          title={c.ativo ? 'Clique para pausar esta célula no mapa' : 'Clique para reativar esta célula'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{c.ativo ? 'Ativa' : 'Pausada'}</span>
                        </button>
                      </div>

                      {/* Nome e Faixa Etária */}
                      <div>
                        <h4 className="text-lg md:text-xl font-black text-white">{c.nome}</h4>
                        {c.faixaEtaria && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Users className="w-3.5 h-3.5" /> {c.faixaEtaria}
                          </p>
                        )}
                      </div>

                      {/* Informações de Reunião e Bairro */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="bg-slate-900/60 rounded-xl p-2.5">
                          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-brand-400" /> Encontro
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {dia ? `${dia} ${horario ? `às ${horario}` : ''}` : 'Não definido'}
                          </div>
                        </div>
                        <div className="bg-slate-900/60 rounded-xl p-2.5">
                          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-brand-400" /> Bairro
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5 truncate">
                            {bairro || 'Não informado'}
                          </div>
                        </div>
                      </div>

                      {/* Telefone */}
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/40 px-3 py-2 rounded-xl">
                        <Phone className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span>{c.telefone}</span>
                      </div>
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      {/* Ações de Gestão de Encontros e Pessoas */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/lider/chamada?celulaId=${c.id}`}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20 active:scale-95"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Fazer Chamada
                        </Link>

                        <Link
                          to={`/lider/membros?celulaId=${c.id}`}
                          className="py-2.5 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                        >
                          <Users className="w-3.5 h-3.5 text-brand-400" />
                          Membros
                        </Link>
                      </div>

                      {/* Ações de Edição e Configuração */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          to={`/lider/editar?id=${c.id}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          Editar Dados
                        </Link>

                        {c.itinerante && (
                          <Link
                            to={`/lider/itinerante?id=${c.id}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            Atualizar Semana
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
