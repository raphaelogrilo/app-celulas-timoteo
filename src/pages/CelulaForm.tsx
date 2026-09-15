import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createCelula,
  updateCelula,
  getCelulaById,
  getCelulaByLiderEmailOrUid,
} from '../services/celulaService';
import { vincularLiderCelula, getAllLideres } from '../services/authService';
import { geocodeAddress, formatGoogleMapsAddress } from '../utils/geo';
import { MiniMapPreview } from '../components/MiniMapPreview';
import type { LiderUser, LocalItinerante } from '../types/celula';
import {
  ArrowLeft, Loader2, Save, AlertCircle, MapPin,
  Users, Calendar, Clock, Phone, FileText, Shield, Mail,
  Trash2, Plus, CheckCircle2, Sparkles, Edit3,
} from 'lucide-react';

export const MINISTERIOS_OPCOES = [
  { valor: 'Homens de Atos', perfil: 'Homens', label: 'Homens de Atos' },
  { valor: 'Mulheres de Atitude', perfil: 'Mulheres', label: 'Mulheres de Atitude' },
  { valor: 'Ministério Hope (Casais)', perfil: 'Casais', label: 'Ministério Hope (Casais)' },
  { valor: 'Ministério Flamma (Jovens)', perfil: 'Jovens', label: 'Ministério Flamma (Jovens)' },
  { valor: 'Ministério Flick (Adolescentes)', perfil: 'Adolescentes', label: 'Ministério Flick (Adolescentes)' },
] as const;

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'] as const;

const coordsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const baseSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  ministerio: z.string().min(1, 'Selecione o ministério'),
  perfil: z.string().optional(),
  lider: z.string().min(3, 'Informe o nome do líder'),
  telefone: z.string().min(10, 'Telefone inválido').max(15),
  liderEmail: z.string().optional(),
  descricao: z.string().optional(),
  faixaEtaria: z.string().optional(),
  itinerante: z.boolean(),
  ativo: z.boolean().default(true),

  // Campos para célula FIXA
  dia: z.string().optional(),
  horario: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  pontoReferencia: z.string().optional(),
  coords: coordsSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.itinerante) {
    if (!data.dia) ctx.addIssue({ code: 'custom', path: ['dia'], message: 'Selecione o dia do encontro' });
    if (!data.horario) ctx.addIssue({ code: 'custom', path: ['horario'], message: 'Informe o horário' });
    if (!data.bairro || !data.bairro.trim()) {
      ctx.addIssue({ code: 'custom', path: ['bairro'], message: 'Informe o bairro' });
    }
    if (!data.endereco || data.endereco.trim().length < 4) {
      ctx.addIssue({
        code: 'custom',
        path: ['endereco'],
        message: 'Obrigatório informar o endereço exato (Rua/Avenida e Número, ex: Rua 19 de Novembro, 160) para posicionar a célula no mapa',
      });
    }
    if (!data.coords || typeof data.coords.lat !== 'number' || typeof data.coords.lng !== 'number') {
      ctx.addIssue({
        code: 'custom',
        path: ['endereco'],
        message: 'Obrigatório localizar a posição exata do pin no mapa através do endereço',
      });
    }
  }
});

type FormData = z.infer<typeof baseSchema>;

interface CelulaFormProps {
  mode?: 'create' | 'edit';
}

export default function CelulaForm({ mode = 'create' }: CelulaFormProps) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const celulaIdParam = searchParams.get('id');

  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit' || !!celulaIdParam);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(celulaIdParam);
  const [originalCelula, setOriginalCelula] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lideresList, setLideresList] = useState<LiderUser[]>([]);

  // Estado para múltiplos endereços da rota itinerante
  const [locaisItinerantes, setLocaisItinerantes] = useState<LocalItinerante[]>([]);
  const [localAtivoIndex, setLocalAtivoIndex] = useState<number>(0);
  const [novoLocal, setNovoLocal] = useState({
    identificador: '',
    endereco: '',
    bairro: '',
    dia: 'Quarta-feira',
    horario: '19:30',
    observacao: '',
    coords: { lat: -19.5828, lng: -42.5937 },
  });

  const {
    register, handleSubmit, watch, setValue, reset, setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema) as any,
    defaultValues: { ativo: true, itinerante: false },
  });

  const isItinerante = watch('itinerante');

  // Carrega lista de líderes se for admin
  useEffect(() => {
    if (isAdmin) {
      getAllLideres().then(setLideresList);
    }
  }, [isAdmin]);

  // Carrega dados existentes com checagem de permissão
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      let celula = null;

      if (celulaIdParam) {
        celula = await getCelulaById(celulaIdParam);
      } else if (mode === 'edit') {
        const identifier = currentUser.email || currentUser.id;
        celula = await getCelulaByLiderEmailOrUid(identifier);
      }

      if (!celula) {
        setIsLoadingData(false);
        return;
      }

      // Checagem de segurança: Se não for admin e a célula não pertencer a este líder, bloqueia
      const isOwner =
        celula.liderEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
        celula.liderUid === currentUser.id;

      if (!isAdmin && !isOwner) {
        alert('Acesso negado: Você só pode editar as células vinculadas à sua liderança.');
        navigate('/lider/dashboard');
        return;
      }

      setExistingId(celula.id);
      setOriginalCelula(celula);

      const matchedMin = celula.ministerio || MINISTERIOS_OPCOES.find(m => m.perfil === celula.perfil)?.valor || '';
      const perfilFinal = celula.perfil || MINISTERIOS_OPCOES.find(m => m.valor === matchedMin)?.perfil || 'Homens';

      reset({
        nome: celula.nome || '',
        ministerio: matchedMin,
        perfil: perfilFinal,
        lider: celula.lider || '',
        telefone: celula.telefone || '',
        liderEmail: celula.liderEmail ?? '',
        descricao: celula.descricao ?? '',
        faixaEtaria: celula.faixaEtaria ?? '',
        itinerante: !!celula.itinerante,
        ativo: celula.ativo !== false,
        dia: celula.dia ?? '',
        horario: celula.horario ?? '',
        endereco: celula.endereco ?? '',
        bairro: celula.bairro ?? '',
        pontoReferencia: celula.pontoReferencia ?? '',
        coords: celula.coords,
      });

      if (celula.itinerante) {
        const locais = celula.locaisItinerantes || celula.encontroAtual?.locais || [];
        setLocaisItinerantes(locais);
        if (celula.encontroAtual?.localAtivoId) {
          const foundIdx = locais.findIndex(l => l.id === celula.encontroAtual?.localAtivoId);
          if (foundIdx >= 0) setLocalAtivoIndex(foundIdx);
        }
      } else {
        if (celula.coords) {
          setGeoFeedback(`📍 Pin cadastrado: ${celula.coords.lat.toFixed(4)}, ${celula.coords.lng.toFixed(4)}`);
        }
      }
      setIsLoadingData(false);
    };

    loadData();
  }, [mode, celulaIdParam, currentUser, isAdmin, navigate, reset]);

  // Geocodificação precisa de Endereço Fixo com formatação padrão Google Maps
  const handleAddressGeocode = async () => {
    const rawEnd = watch('endereco') || '';
    const bai = watch('bairro') || '';

    if (!rawEnd.trim() && !bai.trim()) return;

    // Formata o endereço digitado para o padrão Google Maps (ex: "R. Oito de Novembro, 5 - Centro" -> "Rua Oito de Novembro, 5")
    const formattedEnd = formatGoogleMapsAddress(rawEnd);
    if (formattedEnd && formattedEnd !== rawEnd) {
      setValue('endereco', formattedEnd);
    }

    setIsGeocoding(true);
    setGeoFeedback(null);

    const targetAddress = formattedEnd || rawEnd;
    const coords = await geocodeAddress(targetAddress, bai);
    if (coords) {
      setValue('coords', coords);
      setGeoFeedback(`📍 Localização exata encontrada no mapa: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    } else {
      setGeoFeedback('Não foi possível localizar o número exato, usando centro do bairro.');
    }
    setIsGeocoding(false);
  };

  // Geocodificação de Endereço Exato do Novo Local Itinerante
  const handleNovoLocalAddressGeocode = async () => {
    const rawEnd = novoLocal.endereco || '';
    const bai = novoLocal.bairro || '';
    if (!rawEnd.trim() && !bai.trim()) return;

    const formattedEnd = formatGoogleMapsAddress(rawEnd);
    if (formattedEnd) {
      setNovoLocal(prev => ({ ...prev, endereco: formattedEnd }));
    }

    setIsGeocoding(true);
    const coords = await geocodeAddress(formattedEnd || rawEnd, bai);
    if (coords) {
      setNovoLocal(prev => ({ ...prev, coords }));
      setGeoFeedback(`📍 Localização exata encontrada no mapa: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    } else {
      setGeoFeedback('Não foi possível localizar o número exato, usando centro do bairro.');
    }
    setIsGeocoding(false);
  };

  const handleAdicionarNovoLocal = () => {
    if (!novoLocal.identificador.trim()) {
      alert('Informe um nome/identificador para este local (Ex: Casa do Marcos).');
      return;
    }
    if (!novoLocal.endereco?.trim() || novoLocal.endereco.trim().length < 4) {
      alert('Informe o endereço exato com logradouro e número (Ex: Rua 19 de Novembro, 160) para poder adicionar ao mapa.');
      return;
    }
    if (!novoLocal.bairro.trim()) {
      alert('Informe o bairro deste local em Timóteo.');
      return;
    }

    const item: LocalItinerante = {
      id: 'loc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      identificador: novoLocal.identificador.trim(),
      endereco: novoLocal.endereco.trim(),
      bairro: novoLocal.bairro.trim(),
      dia: novoLocal.dia,
      horario: novoLocal.horario,
      observacao: novoLocal.observacao.trim() || undefined,
      coords: novoLocal.coords,
    };

    setLocaisItinerantes(prev => [...prev, item]);
    setNovoLocal({
      identificador: '',
      endereco: '',
      bairro: '',
      dia: 'Quarta-feira',
      horario: '19:30',
      observacao: '',
      coords: { lat: -19.5828, lng: -42.5937 },
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;
    setSubmitError(null);
    try {
      const selectedMinObj = MINISTERIOS_OPCOES.find(m => m.valor === data.ministerio);
      const perfilFinal = selectedMinObj ? selectedMinObj.perfil : (data.perfil || 'Misto');

      const payload: any = {
        ...data,
        ministerio: data.ministerio,
        perfil: perfilFinal,
        itinerante: data.itinerante,
        ativo: data.ativo ?? true,
      };

      if (data.itinerante) {
        if (locaisItinerantes.length === 0) {
          setSubmitError('Para célula itinerante, é obrigatório cadastrar pelo menos um local com endereço exato na rota para posicionar no mapa.');
          return;
        }

        payload.dia = undefined;
        payload.horario = undefined;
        payload.cep = undefined;
        payload.endereco = undefined;
        payload.bairro = undefined;
        payload.pontoReferencia = undefined;
        payload.coords = undefined;
        payload.locaisItinerantes = locaisItinerantes;

        const activeLoc = locaisItinerantes[localAtivoIndex] || locaisItinerantes[0];
        if (activeLoc) {
          payload.encontroAtual = {
            dia: activeLoc.dia || 'Quarta-feira',
            horario: activeLoc.horario || '19:30',
            cep: activeLoc.cep,
            endereco: activeLoc.endereco,
            bairro: activeLoc.bairro,
            coords: activeLoc.coords,
            dataReferencia: originalCelula?.encontroAtual?.dataReferencia || new Date().toISOString().split('T')[0],
            observacao: activeLoc.observacao || '',
            localAtivoId: activeLoc.id,
            locais: locaisItinerantes,
          };
        } else if (originalCelula?.encontroAtual) {
          payload.encontroAtual = {
            ...originalCelula.encontroAtual,
            locais: locaisItinerantes,
          };
        }
      }

      // Determina o e-mail e UID do líder responsável
      const targetLeaderEmail = isAdmin && data.liderEmail?.trim()
        ? data.liderEmail.trim()
        : (originalCelula?.liderEmail || currentUser.email || '');

      const matchedLeader = lideresList.find(
        (l) => l.email.toLowerCase() === targetLeaderEmail.toLowerCase()
      );

      payload.liderEmail = targetLeaderEmail;
      if (matchedLeader) {
        payload.liderUid = matchedLeader.userId || matchedLeader.id;
      } else if (!isAdmin) {
        payload.liderUid = currentUser.id;
      } else if (originalCelula?.liderUid) {
        payload.liderUid = originalCelula.liderUid;
      }

      let celulaId = existingId;

      if (existingId) {
        await updateCelula(existingId, payload);
      } else {
        celulaId = await createCelula(payload);
      }

      // Vincula a célula ao líder no banco de dados se houver e-mail
      if (celulaId && targetLeaderEmail) {
        await vincularLiderCelula(targetLeaderEmail, celulaId);
      }

      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/lider/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError('Erro ao salvar. Verifique sua conexão e tente novamente.');
    }
  };

  const FIELD_CLASS = `w-full px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors`;
  const ERROR_CLASS = `text-[11px] text-red-400 mt-1 flex items-center gap-1`;
  const LABEL_CLASS = `block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-white">
              {mode === 'edit' || celulaIdParam ? 'Editar Célula' : 'Cadastrar Célula'}
            </h1>
          </div>

          <button
            type="submit"
            form="celula-form"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Salvar</>
            )}
          </button>
        </div>
      </header>

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-xs">Carregando dados da célula...</p>
        </div>
      ) : (
        <form
          id="celula-form"
          onSubmit={handleSubmit(onSubmit as any)}
          className="max-w-3xl w-full mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 pb-28 flex-1"
          noValidate
        >

        {/* Nome e Ministério (Grid responsivo no Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}><FileText className="inline w-3.5 h-3.5 mr-1" />Nome da Célula</label>
            <input {...register('nome')} className={FIELD_CLASS} placeholder="Ex: Forja 1, Célula Ágape..." />
            {errors.nome && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.nome.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASS}><Users className="inline w-3.5 h-3.5 mr-1" />Ministério</label>
            <select {...register('ministerio')} className={FIELD_CLASS + ' appearance-none'}>
              <option value="">Selecione o ministério...</option>
              {MINISTERIOS_OPCOES.map(m => (
                <option key={m.valor} value={m.valor}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.ministerio && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.ministerio.message}</p>}
          </div>
        </div>

        {/* Líder e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Nome do Líder</label>
            <input {...register('lider')} className={FIELD_CLASS} placeholder="Nome do líder" />
            {errors.lider && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.lider.message}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS}><Phone className="inline w-3.5 h-3.5 mr-1" />WhatsApp</label>
            <input {...register('telefone')} className={FIELD_CLASS} placeholder="31999998888" type="tel" />
            {errors.telefone && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.telefone.message}</p>}
          </div>
        </div>

        {/* E-mail do Líder (Controle Admin de Vínculo) */}
        {isAdmin && (
          <div className="p-4 md:p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <div className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                Vínculo de Acesso do Líder (Exclusivo Admin)
              </div>
            </div>
            <p className="text-[11px] text-slate-300">
              Associe esta célula ao e-mail Google de um líder cadastrado para que ele possa gerenciá-la pelo painel:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lideresList.length > 0 && (
                <div>
                  <label className={LABEL_CLASS}>Selecionar Líder Autorizado</label>
                  <select
                    onChange={(e) => {
                      const sel = lideresList.find((l) => l.email === e.target.value);
                      if (sel) {
                        setValue('liderEmail', sel.email);
                        if (!watch('lider')) setValue('lider', sel.nome);
                      }
                    }}
                    className={FIELD_CLASS + ' appearance-none'}
                    defaultValue=""
                  >
                    <option value="">Selecione para preencher...</option>
                    {lideresList.map((l) => (
                      <option key={l.id || l.email} value={l.email}>
                        {l.nome} ({l.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={LABEL_CLASS}>
                  <Mail className="inline w-3.5 h-3.5 mr-1" />
                  E-mail Google do Líder
                </label>
                <input
                  {...register('liderEmail')}
                  className={FIELD_CLASS}
                  placeholder="lider@gmail.com"
                  type="email"
                />
              </div>
            </div>
          </div>
        )}

        {/* Faixa Etária / Público */}
        <div>
          <label className={LABEL_CLASS}>Faixa Etária / Público</label>
          <input {...register('faixaEtaria')} className={FIELD_CLASS} placeholder="Ex: 18 a 29 anos, Famílias, etc." />
        </div>

        {/* Toggle Itinerante */}
        <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-bold text-white">Célula Itinerante</div>
              <div className="text-[11px] text-slate-400 mt-0.5">O endereço muda e reveza entre vários locais</div>
            </div>
            <input type="checkbox" {...register('itinerante')} className="sr-only" />
            <div
              onClick={() => setValue('itinerante', !isItinerante)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${isItinerante ? 'bg-amber-500' : 'bg-slate-700'} flex items-center px-1`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isItinerante ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        {/* Painel de Múltiplos Endereços (somente quando ITINERANTE = TRUE) */}
        {isItinerante && (
          <div className="space-y-4 p-4 md:p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <MapPin className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Painel de Endereços da Rota Itinerante
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {locaisItinerantes.length} {locaisItinerantes.length === 1 ? 'local cadastrado' : 'locais cadastrados'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cadastre as casas e locais onde a célula se reúne alternadamente. Você poderá alternar o endereço ativo facilmente a cada semana.
            </p>

            {/* Lista de Locais Cadastrados */}
            {locaisItinerantes.length > 0 && (
              <div className="space-y-2.5">
                {locaisItinerantes.map((loc, idx) => (
                  <div
                    key={loc.id || idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      localAtivoIndex === idx
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{loc.identificador}</span>
                          {localAtivoIndex === idx ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ativo Desta Semana
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLocalAtivoIndex(idx)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                            >
                              Definir como Ativo Desta Semana
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {loc.endereco && <span>🏠 <strong className="text-amber-200">{loc.endereco}</strong></span>}
                          <span>📍 Bairro: <strong className="text-white">{loc.bairro}</strong></span>
                          {loc.cep && <span>CEP: {loc.cep}</span>}
                          {loc.dia && <span>🗓️ {loc.dia} {loc.horario ? `às ${loc.horario}` : ''}</span>}
                        </div>
                        {loc.observacao && (
                          <p className="text-[11px] text-slate-400 italic">Obs: {loc.observacao}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const filtered = locaisItinerantes.filter((_, i) => i !== idx);
                          setLocaisItinerantes(filtered);
                          if (localAtivoIndex >= filtered.length) {
                            setLocalAtivoIndex(Math.max(0, filtered.length - 1));
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Remover este local"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário para Adicionar Novo Local */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Adicionar Novo Endereço / Casa da Rota
              </div>

              <div>
                <label className={LABEL_CLASS}>Identificador / Anfitrião</label>
                <input
                  type="text"
                  value={novoLocal.identificador}
                  onChange={(e) => setNovoLocal({ ...novoLocal, identificador: e.target.value })}
                  placeholder="Ex: Casa do Marcos, Família Silva..."
                  className={FIELD_CLASS}
                />
              </div>

              {/* Endereço Exato do Local Itinerante */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={LABEL_CLASS + ' mb-0'}>
                    Endereço Exato (Rua / Avenida e Número) <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleNovoLocalAddressGeocode}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Localizar no Mapa
                  </button>
                </div>
                <input
                  type="text"
                  value={novoLocal.endereco}
                  onChange={(e) => setNovoLocal({ ...novoLocal, endereco: e.target.value })}
                  onBlur={handleNovoLocalAddressGeocode}
                  placeholder="Ex: Rua 19 de Novembro, 160, Apto 201"
                  className={FIELD_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Bairro</label>
                  <input
                    type="text"
                    value={novoLocal.bairro}
                    onChange={(e) => setNovoLocal({ ...novoLocal, bairro: e.target.value })}
                    placeholder="Ex: Funcionários"
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Dia</label>
                  <select
                    value={novoLocal.dia}
                    onChange={(e) => setNovoLocal({ ...novoLocal, dia: e.target.value })}
                    className={FIELD_CLASS + ' appearance-none'}
                  >
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Horário</label>
                  <input
                    type="time"
                    value={novoLocal.horario}
                    onChange={(e) => setNovoLocal({ ...novoLocal, horario: e.target.value })}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Observação (opcional)</label>
                <input
                  type="text"
                  value={novoLocal.observacao}
                  onChange={(e) => setNovoLocal({ ...novoLocal, observacao: e.target.value })}
                  placeholder="Ex: Levar bíblia e lanche comunitário..."
                  className={FIELD_CLASS}
                />
              </div>

              <button
                type="button"
                onClick={handleAdicionarNovoLocal}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Este Endereço à Lista
              </button>
            </div>
          </div>
        )}

        {/* Campos de Endereço (somente para célula FIXA) */}
        {!isItinerante && (
          <div className="space-y-4 p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Endereço Fixo Obrigatório
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold border border-brand-500/30">
                Obrigatório para o Mapa
              </span>
            </div>

            {/* Banner de Aviso: Endereço Exato Obrigatório */}
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Endereço Exato Obrigatório para Posicionar no Mapa</strong>
                A célula só poderá ser salva e exibida no mapa quando o líder fornecer o endereço exato com número (Rua/Av e Nº) e o pin estiver localizado.
              </div>
            </div>

            {/* Dia e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}><Calendar className="inline w-3.5 h-3.5 mr-1" />Dia do Encontro</label>
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

            {/* Bairro */}
            <div>
              <label className={LABEL_CLASS}>Bairro de Timóteo *</label>
              <input
                {...register('bairro')}
                className={FIELD_CLASS}
                placeholder="Ex: Centro, Funcionários, Ana Rita..."
                onBlur={handleAddressGeocode}
              />
              {errors.bairro && <p className={ERROR_CLASS}><AlertCircle className="w-3 h-3" />{errors.bairro.message}</p>}
            </div>

            {/* Endereço Completo (Rua / Avenida e Número) */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <label className={LABEL_CLASS + ' mb-0'}>
                    Endereço Completo (Rua / Avenida e Número)
                  </label>
                  <div className="flex items-center gap-2">
                    {watch('endereco') && (
                      <button
                        type="button"
                        onClick={() => setFocus('endereco')}
                        className="text-[11px] text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-500/30 active:scale-95"
                        title="Editar endereço digitado"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Editar</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddressGeocode}
                      disabled={isGeocoding}
                      className="text-[11px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isGeocoding ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Localizando...</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> Localizar Pin Exato no Mapa</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    {...register('endereco')}
                    className={FIELD_CLASS + (watch('endereco') ? ' pr-20' : '')}
                    placeholder="Ex: Rua 31 de Março, 240"
                    onBlur={handleAddressGeocode}
                  />
                  {watch('endereco') && (
                    <button
                      type="button"
                      onClick={() => setFocus('endereco')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Editar endereço"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  🔒 <em>O endereço exato posiciona o pin no mapa, mas fica protegido no app público (o visitante vê apenas o bairro).</em>
                </p>
                {geoFeedback && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1.5 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    {geoFeedback}
                  </p>
                )}
              </div>

              {/* Mini Mapa Interativo com Pin Exato */}
              {watch('coords') && watch('coords')?.lat && watch('coords')?.lng && (
                <MiniMapPreview
                  coords={watch('coords')!}
                  title={watch('nome') || 'Local Exato da Célula'}
                  onCoordsChange={(newCoords) => {
                    setValue('coords', newCoords);
                    setGeoFeedback(`📍 Pin ajustado manualmente no mapa: ${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`);
                  }}
                />
              )}
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

        {/* Botão Salvar com Barra Flutuante/Fixa */}
        <div className="pt-4 sticky bottom-4 z-20">
          <div className="p-2 rounded-2xl bg-slate-950/85 backdrop-blur-lg border border-white/10 shadow-2xl">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-brand-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando Alterações...</>
              ) : (
                <><Save className="w-4 h-4" /> {mode === 'edit' || celulaIdParam ? 'Salvar Alterações da Célula' : 'Cadastrar Nova Célula'}</>
              )}
            </button>
          </div>
        </div>
        </form>
      )}
    </div>
  );
}
