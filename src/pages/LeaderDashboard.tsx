import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCelulaByLiderEmailOrUid } from '../services/celulaService';
import type { Celula } from '../types/celula';
import { getProfileStyle } from '../utils/geo';
import {
  LogOut, MapPin, Calendar, Clock, Phone, Edit3,
  RefreshCw, PlusCircle, AlertTriangle, Compass, CheckCircle2,
  ChevronRight, Users, Navigation,
} from 'lucide-react';

export default function LeaderDashboard() {
  const { currentUser, liderData, logout } = useAuth();
  const [celula, setCelula] = useState<Celula | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email && !currentUser?.id) return;
    const identifier = currentUser.email || currentUser.id;
    getCelulaByLiderEmailOrUid(identifier).then((c) => {
      setCelula(c);
      setLoading(false);
    });
  }, [currentUser]);

  const style = celula ? getProfileStyle(celula.perfil) : null;

  const dia = celula?.itinerante ? celula.encontroAtual?.dia : celula?.dia;
  const horario = celula?.itinerante ? celula.encontroAtual?.horario : celula?.horario;
  const endereco = celula?.itinerante ? celula.encontroAtual?.endereco : celula?.endereco;
  const bairro = celula?.itinerante ? celula.encontroAtual?.bairro : celula?.bairro;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Painel do Líder</div>
            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {liderData?.nome || currentUser?.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !celula ? (

          /* Sem célula cadastrada */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Nenhuma célula cadastrada</h2>
            <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
              Cadastre sua célula para que os visitantes possam encontrar você no mapa de Timóteo.
            </p>
            <Link
              to="/lider/cadastro"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Cadastrar Minha Célula
            </Link>
          </div>

        ) : (

          /* Célula encontrada */
          <>
            {/* Badge de Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${celula.ativo ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              {celula.ativo ? 'Célula ativa e visível no mapa' : 'Célula inativa — não aparece no mapa'}
              {celula.itinerante && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                  🚶 Itinerante
                </span>
              )}
            </div>

            {/* Card da Célula */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {style && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${style.badgeBg} ${style.badgeText} mb-2 inline-block`}>
                      {celula.perfil}
                    </span>
                  )}
                  <h2 className="text-xl font-extrabold text-white">{celula.nome}</h2>
                  {celula.faixaEtaria && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> {celula.faixaEtaria}
                    </p>
                  )}
                </div>
                <Link
                  to="/lider/editar"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                  title="Editar célula"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
              </div>

              {/* Encontro */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 rounded-2xl p-3 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Dia</div>
                    <div className="text-sm font-bold text-white">{dia || '—'}</div>
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-3 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Horário</div>
                    <div className="text-sm font-bold text-white">{horario || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-slate-800/60 rounded-2xl p-3 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Endereço</div>
                  <div className="text-sm font-medium text-white">
                    {endereco || '—'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Bairro {bairro} {celula.itinerante && celula.encontroAtual?.dataReferencia && (
                      <span className="ml-1 text-amber-400">
                        · Semana de {new Date(celula.encontroAtual.dataReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Telefone */}
              <div className="bg-slate-800/60 rounded-2xl p-3 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Contato</div>
                  <div className="text-sm font-bold text-white">{celula.telefone}</div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Ações Rápidas</h3>

              <Link
                to="/lider/editar"
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Editar Dados da Célula</div>
                    <div className="text-[11px] text-slate-400">Nome, perfil, contato, descrição...</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              {celula.itinerante && (
                <Link
                  to="/lider/itinerante"
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-300">Atualizar Endereço da Semana</div>
                      <div className="text-[11px] text-amber-400/70">Informe onde será o encontro desta semana</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </Link>
              )}

              <a
                href="/"
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-500/20 text-slate-400 flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Ver Mapa Público</div>
                    <div className="text-[11px] text-slate-400">Como os visitantes veem sua célula</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>

              {/* Aviso itinerante sem encontroAtual */}
              {celula.itinerante && !celula.encontroAtual && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-amber-300">Endereço da semana não definido</div>
                    <p className="text-[11px] text-amber-400/70 mt-0.5">
                      Sua célula é itinerante mas sem o endereço desta semana preenchido, ela não aparecerá no mapa. Atualize agora.
                    </p>
                    <Link
                      to="/lider/itinerante"
                      className="inline-block mt-2 text-xs font-bold text-amber-300 underline underline-offset-2"
                    >
                      Definir agora →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Link Admin */}
        {liderData?.isAdmin && (
          <div className="pt-2">
            <Link
              to="/admin"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
            >
              Acessar Painel Admin
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
