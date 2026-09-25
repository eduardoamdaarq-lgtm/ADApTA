import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

// Helper to get GoogleGenAI instance safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// API: Diagnose single non-conformity or item with NBR 9050 AI Specialist
app.post('/api/gemini/diagnose', async (req, res) => {
  try {
    const { itemTitle, category, standard, measurement, notes, status, photoBase64 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback deterministic rule-based response
      return res.json({
        success: true,
        source: 'rule_engine',
        diagnosis: `Identificada não conformidade em relação aos parâmetros da norma ${standard || 'ABNT NBR 9050'}. ${notes ? 'Observação de campo: ' + notes + '.' : ''} ${measurement ? 'Medição registrada: ' + measurement + '.' : ''}`,
        recommendation: `Proceder à adequação física conforme critérios da ABNT NBR 9050, regularizando dimensões, desníveis e acabamento conforme especificado no projeto de acessibilidade.`,
        criticality: 'Médio',
        normativeClause: standard || 'ABNT NBR 9050:2020',
      });
    }

    const prompt = `Você é um Perito Especialista em Acessibilidade Arquitetônica e Engenharia Legal credenciado (CAU/CREA), atuando conforme ABNT NBR 9050:2020, ABNT NBR 16537 (Sinalização Tátil), Lei 13.146/2015 (LBI) e Decreto 5.296/2004.
Analise os dados de campo desta inspeção predial e elabore um parecer técnico pericial formal para o Laudo de Acessibilidade:

- Elemento Inspecionado: ${itemTitle}
- Categoria / Setor: ${category}
- Norma de Referência: ${standard || 'ABNT NBR 9050:2020'}
- Status da Inspeção: ${status || 'Não Conforme'}
- Medição Aferida em Campo: ${measurement || 'Não especificada'}
- Apontamento do Vistoriador: ${notes || 'Sem observações adicionais'}

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown de código e sem texto adicional fora do JSON) com esta estrutura exata:
{
  "diagnosis": "Texto pericial detalhado descrevendo a irregularidade física encontrada e o impacto para a pessoa com deficiência ou mobilidade reduzida",
  "normativeClause": "Item específico da ABNT NBR 9050 ou NBR 16537 violado com limites exigidos pela norma",
  "recommendation": "Solução arquitetônica / executiva detalhada para sanar a irregularidade",
  "criticality": "Crítico" | "Médio" | "Baixo",
  "priorityGUT": 5 | 4 | 3 | 2 | 1,
  "suggestedDeadlineDays": 30 | 60 | 90 | 180
}`;

    const contents: any[] = [];
    if (photoBase64 && typeof photoBase64 === 'string') {
      const cleanBase64 = photoBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        }
      });
    }
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleaned = text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const result = JSON.parse(cleaned);

    res.json({
      success: true,
      source: 'gemini',
      ...result,
    });
  } catch (error: any) {
    console.error('Error generating diagnosis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar análise com IA',
    });
  }
});

// API: Generate executive summary and conclusive technical opinion for Laudo
app.post('/api/gemini/laudo-summary', async (req, res) => {
  try {
    const { buildingName, address, buildingType, totalItems, conformItems, nonConformItems, naItems, nonConformities } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const score = totalItems - naItems > 0 ? Math.round((conformItems / (totalItems - naItems)) * 100) : 0;
      let classification = 'Acessibilidade Plena';
      if (score < 50) classification = 'Condição Crítica / Inacessível';
      else if (score < 80) classification = 'Acessibilidade Parcial';

      return res.json({
        success: true,
        source: 'rule_engine',
        executiveSummary: `A edificação ${buildingName || 'avaliada'} apresentou um índice de conformidade normativa de ${score}% segundo os preceitos da ABNT NBR 9050 e legislação vigente. Foram identificados ${nonConformItems} apontamentos de não conformidade que necessitam de intervenção corretiva para garantia do desenho universal e autonomia dos usuários.`,
        classification,
        generalRecommendations: [
          'Priorizar a regularização imediata das rotas acessíveis e desníveis nos acessos principais.',
          'Adequar sanitários acessíveis instalando barras de apoio e garantindo raio de giro mínimo.',
          'Implementar sinalização tátil de piso (alerta e direcional) e placas com caracteres em relevo e Braille.'
        ],
        legalBasis: 'ABNT NBR 9050:2020, ABNT NBR 16537:2016, Lei Federal nº 13.146/2015 (Estatuto da Pessoa com Deficiência) e Decreto Federal nº 5.296/2004.'
      });
    }

    const prompt = `Você é um Perito Judicial e Arquiteto Especialista em Laudos Técnicos de Acessibilidade (ABNT NBR 9050:2020 e NBR 16747 Inspeção Predial).
Redija o Resumo Executivo e Conclusão Técnica Pericial para o Laudo de Acessibilidade com os dados abaixo:

- Edificação: ${buildingName} (${buildingType || 'Uso Misto/Comercial'})
- Localização: ${address || 'Local não informado'}
- Total de Itens Inspecionados: ${totalItems}
- Conformes: ${conformItems}
- Não Conformes: ${nonConformItems}
- Não se Aplica: ${naItems}
- Principais Irregularidades registradas em campo:
${JSON.stringify((nonConformities || []).slice(0, 10), null, 2)}

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem marcadores markdown adicionais) no formato:
{
  "executiveSummary": "Texto formal pericial de 2 a 3 parágrafos sintetizando a vistoria técnica, estado geral da edificação e conformidade com o Desenho Universal",
  "classification": "Acessibilidade Plena" | "Acessibilidade Parcial com Restrições" | "Condição Crítica / Inacessível",
  "generalRecommendations": [
    "Recomendação prioritária 1",
    "Recomendação prioritária 2",
    "Recomendação prioritária 3",
    "Recomendação prioritária 4"
  ],
  "technicalConclusion": "Parecer conclusivo formal sobre a responsabilidade do proprietário/administrador, risco de autuação perante Ministério Público / órgãos fiscalizadores e importância da implementação do cronograma físico de obras",
  "legalBasis": "ABNT NBR 9050:2020, ABNT NBR 16537, Lei 13.146/2015 (LBI), Decreto 5.296/2004 e NBR 16747:2020"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleaned = text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const result = JSON.parse(cleaned);

    res.json({
      success: true,
      source: 'gemini',
      ...result,
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar laudo',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server listening on port ${portNumber}`);
  });
}

startServer();
