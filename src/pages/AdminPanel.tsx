import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllLideres, createLider, deleteLider } from '../services/authService';
import { listenCelulas, toggleCelulaAtivo, deleteCelula } from '../services/celulaService';
import type { LiderUser, Celula } from '../types/celula';
import {
  Users, Plus, Trash2, Power, PowerOff, Loader2, AlertCircle,
  ArrowLeft, Shield, MapPin, ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';

const newLiderSchema = z.object({
  email: z.string().email('E-mail Google válido é obrigatório'),
  nome: z.string().min(3, 'Informe o nome completo do líder'),
  isAdmin: z.boolean().default(false),
});

type NewLiderForm = z.infer<typeof newLiderSchema>;

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [lideres, setLideres] = useState<LiderUser[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

    const unsub = listenCelulas((data) => setCelulas(data));
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

  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;
  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/lider/dashboard')}
          className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" /> Painel Geral Admin
          </div>
          <div className="text-[11px] text-slate-400">
            Controle exclusivo de líderes autorizados e células
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {loadingData ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Feedback */}
            {submitMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {submitMsg}
              </div>
            )}

            {/* ===== Seção Líderes Autorizados ===== */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Líderes Autorizados ({lideres.length})
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Autorizar Líder
                  {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Form Autorizar Novo Líder */}
              {showForm && (
                <form
                  onSubmit={handleSubmit(onCreateLider as any)}
                  className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <h3 className="text-sm font-bold text-white">Autorizar Novo Líder</h3>
                  <p className="text-[11px] text-slate-400">
                    O líder poderá entrar diretamente usando a conta Google vinculada a este e-mail.
                  </p>

                  <div>
                    <label className={LABEL_CLASS}>Nome do Líder</label>
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
                    <label className={LABEL_CLASS}>E-mail Google do Líder</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={FIELD_CLASS}
                      placeholder="exemplo@gmail.com"
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
                    <span className="text-xs text-slate-300">Conceder privilégios de Admin</span>
                  </label>

                  {submitError && (
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                      </>
                    ) : (
                      'Autorizar Acesso do Líder'
                    )}
                  </button>
                </form>
              )}

              {/* Lista de Líderes */}
              <div className="space-y-2">
                {lideres.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                    Nenhum líder cadastrado ainda. Clique em "Autorizar Líder" acima.
                  </div>
                ) : (
                  lideres.map((l) => (
                    <div
                      key={l.id || l.uid}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {l.nome}
                          {l.isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{l.email}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {l.userId ? '✓ Conta Google conectada' : 'Aguardando primeiro login Google'}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteLider(l.id || l.uid || '', l.nome)}
                        title="Revogar autorização"
                        className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ===== Seção Células ===== */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5" /> Todas as Células ({celulas.length})
              </h2>
              <div className="space-y-2">
                {celulas.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                    Nenhuma célula cadastrada no banco.
                  </div>
                ) : (
                  celulas.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {c.nome}
                          {c.itinerante && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                              Itinerante
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.perfil} · Líder: {c.lider}
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            c.ativo ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {c.ativo ? '● Ativa' : '● Inativa'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCelulaAtivo(c.id, !c.ativo)}
                          title={c.ativo ? 'Inativar' : 'Ativar'}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            c.ativo
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`}
                        >
                          {c.ativo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Excluir permanentemente "${c.nome}"?`)) {
                              await deleteCelula(c.id);
                            }
                          }}
                          title="Excluir célula"
                          className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
