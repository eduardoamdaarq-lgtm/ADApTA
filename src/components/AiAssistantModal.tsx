import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, BookOpen, AlertCircle } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o Assistente Técnico Especialista em Acessibilidade Arquitetônica (ABNT NBR 9050:2020, NBR 16537 e Lei Brasileira de Inclusão). Como posso auxiliar em sua vistoria de campo ou elaboração de parecer pericial?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle: 'Consulta Normativa Geral',
          category: 'Consultoria Técnica NBR 9050',
          standard: 'ABNT NBR 9050:2020 / NBR 16537',
          measurement: '',
          notes: textToSend,
          status: 'nao_conforme',
        }),
      });

      const data = await res.json();
      if (data.diagnosis || data.recommendation) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: `${data.normativeClause ? `**Base Normativa:** ${data.normativeClause}\n\n` : ''}${data.diagnosis}\n\n**Recomendação Técnica:** ${data.recommendation}`,
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error();
      }
    } catch {
      // Intelligent rule-based fallback response
      let answer = 'Conforme a ABNT NBR 9050:2020, as rotas acessíveis devem ser contínuas, desobstruídas e sinalizadas. Rampas devem respeitar a declividade máxima de 8,33% (1:12). Portas devem ter vão livre útil mínimo de 0,80m. Sanitários acessíveis exigem giro de 360° com diâmetro livre de 1,50m e barras de apoio fixadas a 0,75m do piso acabado.';
      if (textToSend.toLowerCase().includes('rampa')) {
        answer = 'Segundo a Tabela 4 da ABNT NBR 9050:2020: para desníveis até 1,00m a inclinação máxima é de 8,33% (1:12). Para desníveis entre 1,00m e 1,50m, inclinação máxima de 6,25% (1:16). Patamares intermediários com extensão mínima de 1,20m são obrigatórios a cada 50m de desnível ou mudança de direção.';
      } else if (textToSend.toLowerCase().includes('sanitário') || textToSend.toLowerCase().includes('banheiro')) {
        answer = 'No sanitário acessível unissex (NBR 9050 item 7.5): raio de rotação livre de 1,50m; barras de apoio retas a 0,75m de altura do piso; bacia com assento a 43-45cm; torneira tipo alavanca ou sensor; botão/cordão de emergência instalado a 40cm do piso.';
      } else if (textToSend.toLowerCase().includes('piso tátil') || textToSend.toLowerCase().includes('tátil')) {
        answer = 'Conforme ABNT NBR 16537:2016: piso tátil de alerta deve ser instalado a 25-32cm do primeiro degrau/desnível, com largura de faixa entre 25cm e 60cm, e contraste de luminância (LRV) que garanta visualização clara em relação ao piso adjacente.';
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Quais são os limites de inclinação para rampas na NBR 9050?',
    'Quais são as medidas mínimas e barras de apoio do sanitário PCD?',
    'Como deve ser a sinalização tátil no topo de escadas segundo a NBR 16537?',
    'Qual a regra para vão livre de portas e maçanetas?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-xl w-full flex flex-col h-[560px] shadow-xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Assistente Normativo NBR 9050 & NBR 16537
              </h3>
              <p className="text-[11px] text-neutral-500">
                Tire dúvidas de normas, dimensionamentos e redação pericial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-700 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-800 border border-neutral-200 whitespace-pre-line'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 text-neutral-600 rounded-lg p-3 flex items-center gap-2 border border-neutral-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                <span>Consultando normas ABNT...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2 border-t border-neutral-100 bg-neutral-50/50 flex flex-wrap gap-1.5 shrink-0">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 px-2 py-1 rounded transition-colors text-left truncate max-w-xs cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Digite sua dúvida sobre acessibilidade arquitetônica..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-md transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
