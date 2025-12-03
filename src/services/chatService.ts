import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useDebtStore } from '../stores/useDebtStore';

const API_KEY = 'AIzaSyAd_ZbBH09QQ1fDS27QLEFoAtqK4svVPfs'; // Em produção, usar variável de ambiente
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Coletar contexto atual
    const { balance, overdrafts, creditCards } = useFinanceStore.getState();
    const { debts } = useDebtStore.getState();

    const totalDebt = debts.reduce((acc, d) => acc + d.amount, 0);
    const totalCreditLimit = creditCards.reduce((acc, c) => acc + c.limit, 0);
    const totalOverdraftLimit = overdrafts.reduce((acc, o) => acc + o.limit, 0);

    const contextPrompt = `
      Você é um assistente financeiro pessoal inteligente e empático.
      
      DADOS FINANCEIROS ATUAIS DO USUÁRIO:
      - Saldo em Conta: R$ ${balance.toFixed(2)}
      - Limite Total Cheque Especial: R$ ${totalOverdraftLimit.toFixed(2)}
      - Total em Dívidas: R$ ${totalDebt.toFixed(2)}
      - Limite Total de Crédito: R$ ${totalCreditLimit.toFixed(2)}
      
      DETALHES DOS CHEQUES ESPECIAIS:
      ${overdrafts.map(o => `- ${o.bankName}: Limite R$ ${o.limit.toFixed(2)}`).join('\n')}
      
      DETALHES DAS DÍVIDAS:
      ${debts.map(d => `- ${d.description} (${d.type}): R$ ${d.amount.toFixed(2)} (Vence: ${d.dueDate})`).join('\n')}
      
      DETALHES DOS CARTÕES:
      ${creditCards.map(c => `- ${c.name}: Limite R$ ${c.limit.toFixed(2)}`).join('\n')}
      
      INSTRUÇÕES:
      1. Responda à pergunta do usuário com base nesses dados.
      2. Seja direto, prático e encorajador.
      3. Se o usuário perguntar "quanto devo?", some as dívidas.
      4. Se perguntar "posso comprar isso?", analise o saldo e crédito disponível.
      5. Mantenha um tom de conversa natural.
    `;

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
    });

    // Enviar mensagem com contexto (o contexto é injetado como parte da mensagem do usuário para garantir que o modelo o veja)
    const result = await chat.sendMessage(`${contextPrompt}\n\nPERGUNTA DO USUÁRIO: ${message}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro no chat Gemini:', error);
    return 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.';
  }
};
