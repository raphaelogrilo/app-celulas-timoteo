import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createCelula,
  updateCelula,
  getCelulaByLiderEmailOrUid,
} from '../services/celulaService';
import { vincularLiderCelula } from '../services/authService';
import { fetchCepData } from '../utils/geo';
import { BAIRROS_TIMOTEO } from '../data/bairrosTimoteo';
import {
  ArrowLeft, Loader2, Save, AlertCircle, MapPin,
  Users, Calendar, Clock, Phone, FileText, Info,
} from 'lucide-react';

const PERFIS = ['Jovens', 'Casais', 'Família', 'Homens', 'Mulheres', 'Teens', 'Misto'] as const;
const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'] as const;

const coordsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const baseSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  perfil: z.enum(PERFIS, { message: 'Selecione um perfil' }),
  lider: z.string().min(3, 'Informe o nome do líder'),
  telefone: z.string().min(10, 'Telefone inválido').max(15),
  descricao: z.string().optional(),
  faixaEtaria: z.string().optional(),
  itinerante: z.boolean(),
  ativo: z.boolean().default(true),

  // Campos para célula FIXA
  dia: z.string().optional(),
  horario: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  pontoReferencia: z.string().optional(),
  coords: coordsSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.itinerante) {
    if (!data.dia) ctx.addIssue({ code: 'custom', path: ['dia'], message: 'Selecione o dia do encontro' });
    if (!data.horario) ctx.addIssue({ code: 'custom', path: ['horario'], message: 'Informe o horário' });
    if (!data.cep) ctx.addIssue({ code: 'custom', path: ['cep'], message: 'Informe o CEP' });
    if (!data.endereco) ctx.addIssue({ code: 'custom', path: ['endereco'], message: 'Informe o endereço' });
    if (!data.bairro) ctx.addIssue({ code: 'custom', path: ['bairro'], message: 'Informe o bairro' });
  }
});

type FormData = z.infer<typeof baseSchema>;

interface CelulaFormProps {
  mode?: 'create' | 'edit';
}

export default function CelulaForm({ mode = 'create' }: CelulaFormProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema) as any,
    defaultValues: { ativo: true, itinerante: false },
  });

  const isItinerante = watch('itinerante');

  // Carrega dados existentes no modo edição
  useEffect(() => {
    if (mode === 'edit' && currentUser) {
      const identifier = currentUser.email || currentUser.id;
      getCelulaByLiderEmailOrUid(identifier).then((celula) => {
        if (!celula) return;
        setExistingId(celula.id);
        setValue('nome', celula.nome);
        setValue('perfil', celula.perfil);
        setValue('lider', celula.lider);
        setValue('telefone', celula.telefone);
        setValue('descricao', celula.descricao ?? '');
        setValue('faixaEtaria', celula.faixaEtaria ?? '');
        setValue('itinerante', celula.itinerante);
        setValue('ativo', celula.ativo);
        if (!celula.itinerante) {
          setValue('dia', celula.dia ?? '');
          setValue('horario', celula.horario ?? '');
          setValue('cep', celula.cep ?? '');
          setValue('endereco', celula.endereco ?? '');
          setValue('bairro', celula.bairro ?? '');
          setValue('pontoReferencia', celula.pontoReferencia ?? '');
          if (celula.coords) setValue('coords', celula.coords);
        }
      });
    }
  }, [mode, currentUser]);

  // Busca de CEP automática
  const handleCepBlur = async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setIsLoadingCep(true);
    setCepFeedback(null);

    const data = await fetchCepData(digits);
    if (data && !data.erro) {
      if (data.logradouro) setValue('endereco', data.logradouro);
      if (data.bairro) {
        setValue('bairro', data.bairro);
        // Tenta encontrar coords do bairro de Timóteo
        const found = BAIRROS_TIMOTEO.find(
          b => b.nome.toLowerCase() === (data.bairro ?? '').toLowerCase()
        );
        if (found) {
          setValue('coords', found.coords);
          setCepFeedback(`✓ Localizado: ${data.bairro}`);
        } else {
          setCepFeedback(`Bairro "${data.bairro}" encontrado. Verifique se está em Timóteo.`);
        }
      }
    } else {
      setCepFeedback('CEP não encontrado.');
    }
    setIsLoadingCep(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        liderUid: currentUser.id,
        liderEmail: currentUser.email ?? '',
        itinerante: data.itinerante,
        ativo: data.ativo ?? true,
        // Para célula itinerante, limpa campos fixos
        ...(data.itinerante ? {
          dia: undefined, horario: undefined, cep: undefined,
          endereco: undefined, bairro: undefined, pontoReferencia: undefined, coords: undefined,
          encontroAtual: undefined,
        } : {}),
      };

      if (mode === 'edit' && existingId) {
        await updateCelula(existingId, payload);
      } else {
        const id = await createCelula(payload);
        await vincularLiderCelula(currentUser.email || currentUser.id, id);
      }

      navigate('/lider/dashboard');
    } catch (err: any) {
      console.error(err);
      setSubmitError('Erro ao salvar. Verifique sua conexão e tente novamente.');
    }
  };

  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;
  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-bold text-white">
          {mode === 'edit' ? 'Editar Célula' : 'Cadastrar Célula'}
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-lg mx-auto px-4 py-6 space-y-6" noValidate>

        {/* Nome */}
        <div>
          <label className={LABEL_CLASS}><FileText className="inline w-3.5 h-3.5 mr-1" />Nome da Célula</label>
          <input {...register('nome')} className={FIELD_CLASS} placeholder="Ex: Célula Ágape" />
          {errors.nome && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.nome.message}</p>}
        </div>

        {/* Perfil */}
        <div>
          <label className={LABEL_CLASS}><Users className="inline w-3.5 h-3.5 mr-1" />Perfil do Grupo</label>
          <select {...register('perfil')} className={FIELD_CLASS + ' appearance-none'}>
            <option value="">Selecione...</option>
            {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.perfil && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.perfil.message}</p>}
        </div>

        {/* Líder e Telefone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Líder</label>
            <input {...register('lider')} className={FIELD_CLASS} placeholder="Nome do líder" />
            {errors.lider && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.lider.message}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS}><Phone className="inline w-3.5 h-3.5 mr-1" />WhatsApp</label>
            <input {...register('telefone')} className={FIELD_CLASS} placeholder="31999998888" type="tel" />
            {errors.telefone && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.telefone.message}</p>}
          </div>
        </div>

        {/* Descrição e Faixa Etária */}
        <div>
          <label className={LABEL_CLASS}>Descrição da Célula</label>
          <textarea {...register('descricao')} className={FIELD_CLASS + ' resize-none h-20'} placeholder="Um breve texto sobre o grupo..." />
        </div>
        <div>
          <label className={LABEL_CLASS}>Faixa Etária / Público</label>
          <input {...register('faixaEtaria')} className={FIELD_CLASS} placeholder="Ex: 18 a 29 anos, Famílias, etc." />
        </div>

        {/* Toggle Itinerante */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-bold text-white">Célula Itinerante</div>
              <div className="text-[11px] text-slate-400 mt-0.5">O endereço muda a cada semana</div>
            </div>
            <input type="checkbox" {...register('itinerante')} className="sr-only" />
            <div
              onClick={() => setValue('itinerante', !isItinerante)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${isItinerante ? 'bg-amber-500' : 'bg-slate-700'} flex items-center px-1`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isItinerante ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </label>
          {isItinerante && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Para célula itinerante, você atualizará o endereço e dia semanalmente no painel após o cadastro.
            </div>
          )}
        </div>

        {/* Campos de Endereço (somente para célula FIXA) */}
        {!isItinerante && (
          <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Endereço Fixo
            </h3>

            {/* Dia e Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}><Calendar className="inline w-3.5 h-3.5 mr-1" />Dia</label>
                <select {...register('dia')} className={FIELD_CLASS + ' appearance-none'}>
                  <option value="">Selecione...</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dia && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.dia.message}</p>}
              </div>
              <div>
                <label className={LABEL_CLASS}><Clock className="inline w-3.5 h-3.5 mr-1" />Horário</label>
                <input {...register('horario')} type="time" className={FIELD_CLASS} />
                {errors.horario && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.horario.message}</p>}
              </div>
            </div>

            {/* CEP */}
            <div>
              <label className={LABEL_CLASS}>CEP</label>
              <div className="relative">
                <input
                  {...register('cep')}
                  className={FIELD_CLASS + ' pr-10'}
                  placeholder="35180-000"
                  maxLength={9}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                />
                {isLoadingCep && (
                  <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-brand-400" />
                )}
              </div>
              {cepFeedback && <p className="text-[11px] text-brand-400 mt-1">{cepFeedback}</p>}
              {errors.cep && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.cep.message}</p>}
            </div>

            {/* Endereço */}
            <div>
              <label className={LABEL_CLASS}>Endereço Completo</label>
              <input {...register('endereco')} className={FIELD_CLASS} placeholder="Rua, número" />
              {errors.endereco && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.endereco.message}</p>}
            </div>

            {/* Bairro */}
            <div>
              <label className={LABEL_CLASS}>Bairro</label>
              <input {...register('bairro')} className={FIELD_CLASS} placeholder="Ex: Funcionários" />
              {errors.bairro && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.bairro.message}</p>}
            </div>

            {/* Ponto de Referência */}
            <div>
              <label className={LABEL_CLASS}>Ponto de Referência</label>
              <input {...register('pontoReferencia')} className={FIELD_CLASS} placeholder="Ex: Perto da padaria central" />
            </div>
          </div>
        )}

        {/* Erro de Submit */}
        {submitError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        {/* Botão Salvar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-[0.98] transition-all"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4" /> {mode === 'edit' ? 'Salvar Alterações' : 'Cadastrar Célula'}</>
          )}
        </button>
      </form>
    </div>
  );
}
