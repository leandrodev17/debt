import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  CircularProgress,
  Avatar
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { sendChatMessage } from '../services/chatService';
import type { ChatMessage } from '../services/chatService';
import { v4 as uuidv4 } from 'uuid';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Enviar histórico recente para contexto (últimas 10 mensagens)
      const history = messages.slice(-10);
      const responseText = await sendChatMessage(userMessage.text, history);

      const botMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: 'var(--primary-color)',
          '&:hover': { backgroundColor: '#535bf2' }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Janela do Chat */}
      {isOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 350,
            height: 500,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--glass-border)',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Assistente Financeiro
            </Typography>
          </Box>

          {/* Lista de Mensagens */}
          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center', mt: 4 }}>
                Olá! Sou seu assistente financeiro. Pergunte sobre seus débitos, saldo ou peça conselhos!
              </Typography>
            )}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {msg.role === 'model' && <Avatar sx={{ width: 24, height: 24, bgcolor: 'var(--primary-color)' }}><SmartToyIcon sx={{ fontSize: 16 }} /></Avatar>}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: 2,
                    borderTopRightRadius: msg.role === 'user' ? 0 : 2,
                    borderTopLeftRadius: msg.role === 'model' ? 0 : 2
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
                {msg.role === 'user' && <Avatar sx={{ width: 24, height: 24, bgcolor: 'var(--secondary-color)' }}><PersonIcon sx={{ fontSize: 16 }} /></Avatar>}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 4 }}>
                <CircularProgress size={20} sx={{ color: 'var(--text-secondary)' }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
                '& .MuiInputBase-input': { color: '#000000' }
              }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={isLoading || !input.trim()} sx={{ backgroundColor: 'var(--primary-color)', color: 'white', '&:hover': { backgroundColor: '#535bf2' } }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};
