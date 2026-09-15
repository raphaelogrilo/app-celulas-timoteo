import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCelulaById, getCelulaByLiderEmailOrUid, updateEncontroAtual } from '../services/celulaService';
import { fetchCepData } from '../utils/geo';
import { BAIRROS_TIMOTEO } from '../data/bairrosTimoteo';
import type { Celula } from '../types/celula';
import {
  ArrowLeft, Save, Loader2, AlertCircle, MapPin, Calendar, Clock, Info, RefreshCw,
} from 'lucide-react';

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'] as const;

const schema = z.object({
  dia: z.string().min(1, 'Selecione o dia'),
  horario: z.string().min(1, 'Informe o horário'),
  cep: z.string().min(8, 'CEP inválido'),
  endereco: z.string().min(5, 'Informe o endereço'),
  bairro: z.string().min(2, 'Informe o bairro'),
  pontoReferencia: z.string().optional(),
  observacao: z.string().optional(),
  dataReferencia: z.string().min(1, 'Informe a data do encontro'),
  lat: z.number(),
  lng: z.number(),
});

type FormData = z.infer<typeof schema>;

export default function ItineranteUpdate() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const celulaIdParam = searchParams.get('id');

  const [celula, setCelula] = useState<Celula | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataReferencia: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      let c: Celula | null = null;

      if (celulaIdParam) {
        c = await getCelulaById(celulaIdParam);
      } else {
        const identifier = currentUser.email || currentUser.id;
        c = await getCelulaByLiderEmailOrUid(identifier);
      }

      if (!c || !c.itinerante) {
        navigate(isAdmin ? '/admin' : '/lider/dashboard');
        return;
      }

      // Checagem de segurança
      const isOwner =
        c.liderEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
        c.liderUid === currentUser.id;

      if (!isAdmin && !isOwner) {
        alert('Acesso negado: Você só pode atualizar a semana da sua própria célula.');
        navigate('/lider/dashboard');
        return;
      }

      setCelula(c);

      // Preenche com o encontroAtual existente
      if (c.encontroAtual) {
        const e = c.encontroAtual;
        setValue('dia', e.dia as string);
        setValue('horario', e.horario);
        setValue('cep', e.cep);
        setValue('endereco', e.endereco);
        setValue('bairro', e.bairro);
        setValue('pontoReferencia', e.pontoReferencia ?? '');
        setValue('observacao', e.observacao ?? '');
        setValue('dataReferencia', e.dataReferencia);
        setValue('lat', e.coords.lat);
        setValue('lng', e.coords.lng);
      }
    };

    loadData();
  }, [currentUser, celulaIdParam, isAdmin, navigate, setValue]);

  const handleCepBlur = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    setCepMsg(null);
    const data = await fetchCepData(digits);
    if (data && !data.erro) {
      if (data.logradouro) setValue('endereco', data.logradouro);
      if (data.bairro) {
        setValue('bairro', data.bairro);
        const found = BAIRROS_TIMOTEO.find(
          b => b.nome.toLowerCase() === (data.bairro ?? '').toLowerCase()
        );
        if (found) {
          setValue('lat', found.coords.lat);
          setValue('lng', found.coords.lng);
          setCepMsg(`✓ ${data.bairro} encontrado`);
        } else {
          setCepMsg(`Bairro "${data.bairro}" localizado. Verifique se está em Timóteo.`);
        }
      }
    } else {
      setCepMsg('CEP não encontrado');
    }
    setLoadingCep(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!celula) return;
    setSubmitError(null);
    try {
      await updateEncontroAtual(celula.id, {
        dia: data.dia,
        horario: data.horario,
        cep: data.cep,
        endereco: data.endereco,
        bairro: data.bairro,
        pontoReferencia: data.pontoReferencia,
        observacao: data.observacao,
        dataReferencia: data.dataReferencia,
        coords: { lat: data.lat, lng: data.lng },
      });
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/lider/dashboard');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Erro ao salvar. Verifique sua conexão.');
    }
  };

  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors`;
  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Atualizar Endereço desta Semana
              </div>
              {celula && <div className="text-[11px] text-amber-400/80">{celula.nome}</div>}
            </div>
          </div>

          <button
            type="submit"
            form="itinerante-form"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Salvar</>
            )}
          </button>
        </div>
      </header>

      <form
        id="itinerante-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl w-full mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 pb-28 flex-1"
        noValidate
      >

        {/* Aviso contextual */}
        <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-amber-300/90 leading-relaxed">
            Informe o endereço, dia e horário do próximo encontro. Essa informação aparecerá no mapa público para os visitantes de Timóteo.
          </p>
        </div>

        {/* Data e Dia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}><Calendar className="inline w-3.5 h-3.5 mr-1" />Data do Encontro</label>
            <input {...register('dataReferencia')} type="date" className={FIELD_CLASS} />
            {errors.dataReferencia && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.dataReferencia.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASS}>Dia da Semana</label>
            <select {...register('dia')} className={FIELD_CLASS + ' appearance-none'}>
              <option value="">Selecione...</option>
              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.dia && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.dia.message}</p>}
          </div>
        </div>

        {/* Horário e CEP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}><Clock className="inline w-3.5 h-3.5 mr-1" />Horário</label>
            <input {...register('horario')} type="time" className={FIELD_CLASS} />
            {errors.horario && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.horario.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASS}><MapPin className="inline w-3.5 h-3.5 mr-1" />CEP (Timóteo)</label>
            <div className="relative">
              <input
                {...register('cep')}
                className={FIELD_CLASS + ' pr-10'}
                placeholder="35180-000"
                maxLength={9}
                onBlur={(e) => handleCepBlur(e.target.value)}
              />
              {loadingCep && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-amber-400" />}
            </div>
            {cepMsg && <p className="text-[11px] text-amber-400 mt-1">{cepMsg}</p>}
            {errors.cep && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.cep.message}</p>}
          </div>
        </div>

        {/* Endereço e Bairro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Endereço Completo</label>
            <input {...register('endereco')} className={FIELD_CLASS} placeholder="Rua, número" />
            {errors.endereco && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.endereco.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASS}>Bairro</label>
            <input {...register('bairro')} className={FIELD_CLASS} placeholder="Ex: Funcionários" />
            {errors.bairro && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.bairro.message}</p>}
          </div>
        </div>

        {/* Ponto de Referência e Observação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Ponto de Referência</label>
            <input {...register('pontoReferencia')} className={FIELD_CLASS} placeholder="Ex: Casa com portão azul..." />
          </div>

          <div>
            <label className={LABEL_CLASS}>Observação (opcional)</label>
            <input {...register('observacao')} className={FIELD_CLASS} placeholder="Ex: Traga sua Bíblia e um lanche..." />
          </div>
        </div>

        {/* Coords ocultos */}
        <input type="hidden" {...register('lat', { valueAsNumber: true })} />
        <input type="hidden" {...register('lng', { valueAsNumber: true })} />
        {errors.lat && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />Localização não encontrada. Verifique o CEP ou bairro.</p>}

        {submitError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        {/* Botão Salvar com Barra Flutuante/Fixa */}
        <div className="pt-4 sticky bottom-4 z-20">
          <div className="p-2 rounded-2xl bg-slate-950/85 backdrop-blur-lg border border-white/10 shadow-2xl">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Atualizando Semana...</>
              ) : (
                <><Save className="w-4 h-4" /> Publicar Endereço no Mapa</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
