import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCelulaByLiderEmailOrUid, updateEncontroAtual } from '../services/celulaService';
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
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
    if (!currentUser?.email && !currentUser?.id) return;
    const identifier = currentUser.email || currentUser.id;
    getCelulaByLiderEmailOrUid(identifier).then((c) => {
      if (!c || !c.itinerante) {
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
    });
  }, [currentUser]);

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
      navigate('/lider/dashboard');
    } catch (err) {
      console.error(err);
      setSubmitError('Erro ao salvar. Verifique sua conexão.');
    }
  };

  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors`;
  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Atualizar Endereço desta Semana
          </div>
          {celula && <div className="text-[11px] text-amber-400/80">{celula.nome}</div>}
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto px-4 py-6 space-y-5" noValidate>

        {/* Aviso contextual */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-400/90 leading-relaxed">
            Informe o endereço, dia e horário do próximo encontro. Essa informação aparecerá no mapa público para os visitantes.
          </p>
        </div>

        {/* Data do Encontro */}
        <div>
          <label className={LABEL_CLASS}><Calendar className="inline w-3.5 h-3.5 mr-1" />Data do Encontro</label>
          <input {...register('dataReferencia')} type="date" className={FIELD_CLASS} />
          {errors.dataReferencia && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.dataReferencia.message}</p>}
        </div>

        {/* Dia e Horário */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Dia da Semana</label>
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
          <label className={LABEL_CLASS}><MapPin className="inline w-3.5 h-3.5 mr-1" />CEP</label>
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

        {/* Endereço e Bairro */}
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

        <div>
          <label className={LABEL_CLASS}>Ponto de Referência</label>
          <input {...register('pontoReferencia')} className={FIELD_CLASS} placeholder="Ex: Casa com portão azul, ao lado da Igreja..." />
        </div>

        <div>
          <label className={LABEL_CLASS}>Observação (opcional)</label>
          <textarea {...register('observacao')} className={FIELD_CLASS + ' resize-none h-16'} placeholder="Algum aviso especial para esta semana?" />
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Atualizando...</>
          ) : (
            <><Save className="w-4 h-4" /> Publicar no Mapa</>
          )}
        </button>
      </form>
    </div>
  );
}
