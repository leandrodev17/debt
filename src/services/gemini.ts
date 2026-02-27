import { GoogleGenerativeAI } from '@google/generative-ai';

// WARNING: In a real production app, this key should be in an environment variable
// and ideally calls should be proxied through a backend to avoid exposing the key.
// For this personal local app, we'll use it directly as requested.
const API_KEY = 'AIzaSyCbCWdgqgQURv5AfuMHUuoInIt5nY0SkuQ';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface FinancialAdvice {
  summary: string;
  timeline: {
    date: string;
    action: string;
    amount: number;
    source: 'balance' | 'credit_card' | 'overdraft' | 'loan';
    sourceName?: string;
    reason: string;
    projectedBalance: number;
  }[];
  recommendations: {
    type: 'warning' | 'tip' | 'success';
    message: string;
  }[];
}

export const getFinancialAdvice = async (
  balance: number,
  debts: any[],
  creditCards: any[],
  overdrafts: any[]
): Promise<FinancialAdvice> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const prompt = `
    Atue como um consultor financeiro pessoal experiente. Analise os seguintes dados financeiros e forneça um plano de ação detalhado e cronológico.

    **Dados Financeiros:**
    - Saldo Atual (Dinheiro disponível): R$ ${balance.toFixed(2)}
    
    **Débitos/Dívidas:**
    ${JSON.stringify(debts, null, 2)}

    **Cartões de Crédito/Limites:**
    ${JSON.stringify(creditCards, null, 2)}

    **Cheques Especiais:**
    ${JSON.stringify(overdrafts, null, 2)}

    **Instruções:**
    1. Analise o saldo disponível versus o total de dívidas e seus vencimentos.
    2. Crie uma linha do tempo (timeline) de pagamentos e ações.
    3. Para cada ação, especifique de onde sairá o dinheiro (saldo, cartão de crédito, cheque especial, etc.).
    4. Se o saldo acabar, indique explicitamente qual crédito usar para cobrir o restante, priorizando as menores taxas de juros ou evitando multas maiores.
    5. Se não for possível pagar tudo, sugira o que deixar de pagar (menor impacto) e explique.
    6. Retorne APENAS um JSON válido seguindo estritamente esta estrutura, sem markdown ou texto adicional:

    {
      "summary": "Resumo executivo da situação financeira e estratégia geral.",
      "timeline": [
        {
          "date": "YYYY-MM-DD",
          "action": "Descrição da ação (ex: Pagar Aluguel)",
          "amount": 1000.00,
          "source": "balance" | "credit_card" | "overdraft" | "loan",
          "sourceName": "Nome do banco ou cartão (opcional)",
          "reason": "Explicação curta do porquê desta ação/fonte",
          "projectedBalance": 500.00 (Saldo estimado após a ação)
        }
      ],
      "recommendations": [
        {
          "type": "warning" | "tip" | "success",
          "message": "Conselho ou alerta específico"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpar markdown se houver (```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error fetching financial advice:', error);
    throw new Error('Falha ao obter consultoria da IA. Verifique sua conexão ou tente novamente mais tarde.');
  }
};
