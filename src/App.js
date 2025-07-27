import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Configuração ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    style={{
      width: 24,
      height: 24,
      border: '4px solid rgba(255, 255, 255, 0.2)',
      borderTop: '4px solid #ffffff',
      borderRadius: '50%',
      display: 'inline-block',
    }}
  />
);

const AlertMessage = ({ message, type }) => {
  if (!message) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`p-4 mt-4 text-white text-center rounded-lg ${colors[type] || 'bg-gray-500'}`}
    >
      {message}
    </motion.div>
  );
};

const SuccessDisplay = () => (
  <motion.div
    key="success"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    className="text-center py-8"
  >
    <div className="w-24 h-24 mx-auto">
        <svg className="w-full h-full text-green-400" viewBox="0 0 24 24">
            <motion.path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                stroke="currentColor" strokeWidth="2" fill="none"
            />
        </svg>
    </div>
    <h2 className="text-3xl font-bold mt-4">Verificado!</h2>
    <p className="text-gray-400 mt-2">Sua conta foi validada com sucesso.</p>
  </motion.div>
);

// --- Componente Principal ---

export default function App() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isVerified, setIsVerified] = useState(false); 

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
        setMessage({ text: 'Por favor, insira um e-mail.', type: 'error' });
        return;
    }
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_BASE_URL}/enviar-codigo-verificacao`, {
        recipientEmail: email,
      });
      setMessage({ text: 'Código enviado! Verifique seu e-mail.', type: 'success' });
      setStep(2);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao enviar o código.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
        setMessage({ text: 'O código deve ter 6 dígitos.', type: 'error' });
        return;
    }
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_BASE_URL}/verificar-codigo`, {
        email: email,
        code: code,
      });
      setMessage({ text: '', type: '' }); 
      setIsVerified(true); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Falha na verificação.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans text-white p-4">
      <div className="w-full max-w-md">
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-8 rounded-xl shadow-2xl"
        >
         
          {isVerified ? (
            <SuccessDisplay />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400">Verificação de Conta</h1>
              <p className="text-center text-gray-400 mb-8">
                {step === 1 ? 'Insira seu e-mail para receber o código.' : 'Insira o código de 6 dígitos que você recebeu.'}
              </p>
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form key="step1" onSubmit={handleSendCode} /* ... */ >
                     <div className="mb-4">
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">E-mail</label>
                      <input
                        type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="seu.email@exemplo.com" disabled={isLoading}
                      />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-cyan-800" disabled={isLoading}>
                      {isLoading ? <Spinner /> : 'Enviar Código'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form key="step2" onSubmit={handleVerifyCode} /* ... */ >
                    <div className="mb-4">
                      <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-300">Código de Verificação</label>
                      <input
                        type="text" id="code" maxLength="6" value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition text-center text-2xl tracking-[.5em]"
                        placeholder="------" disabled={isLoading}
                      />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-cyan-800" disabled={isLoading}>
                      {isLoading ? <Spinner /> : 'Verificar'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <AnimatePresence>
                <AlertMessage message={message.text} type={message.type} />
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
