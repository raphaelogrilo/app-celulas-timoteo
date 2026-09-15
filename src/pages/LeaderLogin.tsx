import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, AlertCircle, Loader2, LogOut } from 'lucide-react';

import { AtosLogo } from '../components/AtosLogo';

export default function LeaderLogin() {
  const { currentUser, isAuthorized, unauthorizedEmail, loading, loginGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && currentUser && isAuthorized) {
      navigate('/lider/dashboard');
    }
  }, [loading, currentUser, isAuthorized, navigate]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      await loginGoogle();
    } catch (err: any) {
      console.error('Erro no login com Google:', err);
      setErrorMsg(err?.message || 'Não foi possível iniciar o login com o Google.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo da Igreja Atos & Título */}
      <div className="w-full max-w-sm mb-8 text-center flex flex-col items-center">
        <div className="mb-3">
          <AtosLogo size="lg" showText={true} textColor="white" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight mt-1">
          Área do Líder de Célula
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Igreja Atos · Gestão de Células Timóteo - MG
        </p>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            <p className="text-xs text-slate-400">Verificando autorização...</p>
          </div>
        ) : unauthorizedEmail ? (
          /* Estado de usuário não autorizado pelo Admin */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Conta não autorizada
              </div>
              <p className="leading-relaxed">
                O e-mail <strong className="text-white underline">{unauthorizedEmail}</strong> está autenticado pelo Google, mas <strong>não possui autorização prévia</strong> da administração da igreja.
              </p>
              <p className="text-[11px] text-amber-300/80">
                Solicite ao administrador para autorizar seu e-mail no painel antes de acessar.
              </p>
            </div>

            <button
              onClick={() => logout()}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Entrar com outra conta Google
            </button>
          </div>
        ) : (
          /* Botão de Login com Google */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-300">
                O acesso é exclusivo para líderes previamente cadastrados.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-black/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 text-slate-800 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              {isLoggingIn ? 'Redirecionando...' : 'Continuar com o Google'}
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Apenas o administrador do sistema pode cadastrar novos líderes e conceder acesso.
          </p>
        </div>
      </div>

      {/* Voltar ao mapa */}
      <a
        href="/"
        className="mt-6 text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4"
      >
        ← Voltar ao mapa de células
      </a>
    </div>
  );
}
