import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Award,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types/inspection';

interface LandingPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('eduardoamda.arq@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const defaultUser: UserProfile = {
    name: 'Arq. Eduardo M. Almeida',
    title: 'Arquiteto Especialista em Acessibilidade',
    email: 'eduardoamda.arq@gmail.com',
    council: 'CAU/SP',
    cau: 'CAU/SP nº A145892-3',
    rrtArtDefault: 'RRT nº 2026/0984123-SP',
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      ...defaultUser,
      email: email.trim() || defaultUser.email,
    });
  };

  const handleQuickLoginAsEduardo = () => {
    setEmail('eduardoamda.arq@gmail.com');
    onLogin(defaultUser);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Institucional Minimalista */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-neutral-950">
                ADApTA
              </span>
              <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded tracking-tight">
                Eduardo Almeida - Arquiteto Especialista em Acessibilidade
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade ABNT NBR 9050:2020 &amp; LBI</span>
            </span>
            <button
              onClick={handleQuickLoginAsEduardo}
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
            >
              Acesso Rápido Perito
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Hero + Login Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Coluna Esquerda: Informações Gerais do Aplicativo */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>Plataforma Profissional de Perícia Predial em Acessibilidade</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">
                Avaliação Digital dos Parâmetros Técnicos de Acessibilidade
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl font-normal">
                Solução integrada para arquitetos e peritos realizarem vistorias prediais completas, gerando laudos periciais automáticos, planos de ação com matriz GUT e relatórios executivos para múltiplos edifícios com histórico preservado.
              </p>
            </div>
          </div>

          {/* Coluna Direita: Card de Login & Autenticação */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xl p-6 sm:p-8 relative">
              {/* Badge superior */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-950">Acesso ao Sistema</h2>
                  <p className="text-xs text-neutral-500">Gerenciador de Edificações &amp; Laudos</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Email do Responsável Técnico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@arquiteto.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      Senha de Acesso
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Acesso restrito CAU
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono text-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Manter conectado neste dispositivo</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Entrar no Sistema ADApTA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Acesso Rápido do Especialista */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Acesso Rápido Homologado:
                </div>
                <button
                  type="button"
                  onClick={handleQuickLoginAsEduardo}
                  className="w-full text-left p-3 rounded-xl bg-neutral-50 hover:bg-blue-50/70 border border-neutral-200 hover:border-blue-300 transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      EA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-900">
                        Arq. Eduardo M. Almeida
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        CAU/SP nº A145892-3 · Especialista em Acessibilidade
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Rodapé do Card */}
              <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-[10px] text-neutral-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dados persistidos localmente com segurança integral</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Informativa de Normas Técnicas e Fundamentação */}
        <div className="mt-14 pt-8 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg border border-neutral-200/80">
            <div className="text-xs font-bold text-neutral-900">ABNT NBR 9050:2020</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200/80">
            <div className="text-xs font-bold text-neutral-900">ABNT NBR 16537:2024</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Sinalização tátil no piso — Diretrizes para elaboração de projetos e instalação</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200/80">
            <div className="text-xs font-bold text-neutral-900">Lei Federal 13.146/2015</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Estatuto da Pessoa com Deficiência (LBI) e garantias fundamentais</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-neutral-200/80">
            <div className="text-xs font-bold text-neutral-900">Decreto nº 5.296/2004</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Classificação legal: Edificações de Uso Coletivo e de Uso Público</div>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>ADApTA</strong> · Avaliação Digital dos Parâmetros Técnicos de Acessibilidade
          </div>
          <div className="text-neutral-400">
            Responsável Técnico: Arq. Eduardo M. Almeida · Especialista em Acessibilidade
          </div>
        </div>
      </footer>
    </div>
  );
};
