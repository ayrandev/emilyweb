import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import FloatingButterflies from '../components/FloatingButterflies';
import { User, Phone, Mail, Plus, Trash2, CheckCircle2, Gift, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const DEFAULT_GIFTS = [
  { id: 1, name: 'Vestido de Asas de Borboleta (Tam 4)', category: 'Vestuário', reservedBy: null },
  { id: 2, name: 'Casinha de Fadas de Brinquedo', category: 'Brinquedos', reservedBy: null },
  { id: 3, name: 'Livro Pop-Up "O Jardim Secreto das Borboletas"', category: 'Livros', reservedBy: null },
  { id: 4, name: 'Kit de Massinha Jardim Encantado', category: 'Brinquedos', reservedBy: null },
  { id: 5, name: 'Quebra-Cabeça de Madeira Borboletas', category: 'Educativo', reservedBy: null },
  { id: 6, name: 'Mini Kit de Jardinagem Infantil', category: 'Educativo', reservedBy: null },
  { id: 7, name: 'Pelúcia de Borboleta Lilás', category: 'Brinquedos', reservedBy: null },
  { id: 8, name: 'Jogo de Memória Flores e Insetos', category: 'Educativo', reservedBy: null },
  { id: 9, name: 'Conjunto de Asas e Tiara de Fada', category: 'Fantasia', reservedBy: null },
  { id: 10, name: 'Livro de Colorir com Giz de Cera de Cera Ecológico', category: 'Educativo', reservedBy: null }
];

export default function ConfirmarPresenca() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [step, setStep] = useState('form'); // 'form' | 'success' | 'gifts'
  const [chefe, setChefe] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [acompanhantes, setAcompanhantes] = useState([]); // Array de strings (nomes)
  const [errors, setErrors] = useState({});

  // Lista de presentes
  const [gifts, setGifts] = useState([]);
  const [selectedGiftId, setSelectedGiftId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Auto-fechamento do Toast de notificação
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Carrega presentes do localStorage na montagem
  useEffect(() => {
    const savedGifts = localStorage.getItem('party_gifts');
    if (savedGifts) {
      setGifts(JSON.parse(savedGifts));
    } else {
      localStorage.setItem('party_gifts', JSON.stringify(DEFAULT_GIFTS));
      setGifts(DEFAULT_GIFTS);
    }
  }, []);

  const addAcompanhante = () => {
    if (acompanhantes.length < 4) {
      setAcompanhantes([...acompanhantes, '']);
    }
  };

  const removeAcompanhante = (index) => {
    const newAcompanhantes = acompanhantes.filter((_, i) => i !== index);
    setAcompanhantes(newAcompanhantes);
  };

  const handleAcompanhanteChange = (index, value) => {
    const newAcompanhantes = [...acompanhantes];
    newAcompanhantes[index] = value;
    setAcompanhantes(newAcompanhantes);
  };

  // Validar campos
  const validateForm = () => {
    const tempErrors = {};
    if (!chefe.trim()) tempErrors.chefe = 'O nome é obrigatório';
    if (!telefone.trim()) {
      tempErrors.telefone = 'O telefone é obrigatório';
    } else if (telefone.replace(/\D/g, '').length < 10) {
      tempErrors.telefone = 'Telefone inválido (mínimo 10 dígitos)';
    }
    if (!email.trim()) {
      tempErrors.email = 'O e-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'E-mail inválido';
    }

    // Acompanhantes não podem estar em branco se adicionados
    acompanhantes.forEach((acomp, idx) => {
      if (!acomp.trim()) {
        tempErrors[`acomp_${idx}`] = 'Preencha o nome do acompanhante ou remova-o';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Salvar convidado no localStorage
    const savedGuests = localStorage.getItem('party_guests');
    const guestsList = savedGuests ? JSON.parse(savedGuests) : [];
    
    const newGuest = {
      id: Date.now().toString(),
      chefe: chefe.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      acompanhantes: acompanhantes.map(a => a.trim()).filter(Boolean),
      confirmedAt: new Date().toISOString(),
      reservedGift: null // Será associado depois se escolher presente
    };

    guestsList.push(newGuest);
    localStorage.setItem('party_guests', JSON.stringify(guestsList));
    localStorage.setItem('current_guest_id', newGuest.id); // Guardar ID atual para vincular o presente
    
    // Ir para tela de sucesso intermediária
    setStep('success');
    setShowToast(true);
  };

  const handleReserveGift = (giftId) => {
    const currentGuestId = localStorage.getItem('current_guest_id');
    const savedGuests = localStorage.getItem('party_guests');
    const guestsList = savedGuests ? JSON.parse(savedGuests) : [];
    const guestIndex = guestsList.findIndex(g => g.id === currentGuestId);
    
    const updatedGifts = gifts.map(gift => {
      if (gift.id === giftId) {
        // Se já estiver reservado por outra pessoa, não faz nada
        if (gift.reservedBy) return gift;
        
        // Se o convidado atual já tinha outro presente reservado, precisamos liberar ele
        return { ...gift, reservedBy: chefe };
      }
      // Se este presente era o que o convidado atual já tinha reservado, libera-o
      if (gift.reservedBy === chefe) {
        return { ...gift, reservedBy: null };
      }
      return gift;
    });

    // Atualizar no localStorage de presentes
    localStorage.setItem('party_gifts', JSON.stringify(updatedGifts));
    setGifts(updatedGifts);
    setSelectedGiftId(giftId);

    // Atualizar a referência de presente no convidado
    if (guestIndex !== -1) {
      const selectedGift = updatedGifts.find(g => g.id === giftId);
      guestsList[guestIndex].reservedGift = selectedGift ? selectedGift.name : null;
      localStorage.setItem('party_guests', JSON.stringify(guestsList));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-b from-[#faf6fe] via-[#fff5f7] to-[#f2f8fc]">
      <FloatingButterflies count={12} />

      <div className="relative z-10 w-full max-w-lg bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 p-6 md:p-8 shadow-xl">
        
        {/* Pass 1: Formulário de Confirmação */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-[#8b4f60] uppercase tracking-wider bg-rosa-baby/30 px-3 py-1 rounded-full">
                Passo 1 de 2
              </span>
              <h2 className="font-display text-4xl text-[#6b3040] mt-3">Confirmar Presença</h2>
              <p className="text-xs text-[#8b7d99] mt-1 max-w-xs mx-auto">
                Preencha os dados abaixo para confirmar sua presença no 1º aninho da Emily Maria.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Nome do Chefe da Família"
                  id="chefe"
                  value={chefe}
                  onChange={(e) => setChefe(e.target.value)}
                  placeholder="Seu nome completo"
                  error={errors.chefe}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone de Contato"
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  error={errors.telefone}
                  required
                />

                <Input
                  label="E-mail"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  error={errors.email}
                  required
                />
              </div>

              {/* Seção de Acompanhantes */}
              <div className="p-4 rounded-2xl bg-lilas-soft/30 border border-lilas-medium/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-[#6b5880]">Acompanhantes Adicionais</h3>
                    <p className="text-[10px] text-[#8b7d99]">Adicione os membros da sua família</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAcompanhante}
                    disabled={acompanhantes.length >= 4}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-azul-baby text-[#2c5364] hover:bg-[#bce6fa] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {acompanhantes.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    {acompanhantes.map((acomp, index) => (
                      <div key={index} className="flex gap-2 items-center animate-fadeIn">
                        <Input
                          placeholder={`Nome do acompanhante ${index + 1}`}
                          value={acomp}
                          onChange={(e) => handleAcompanhanteChange(index, e.target.value)}
                          error={errors[`acomp_${index}`]}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeAcompanhante(index)}
                          className="p-3 mt-5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                          title="Remover acompanhante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#b0a7b8] text-center py-4 italic">
                    Nenhum acompanhante adicionado.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold"
              >
                Confirmar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Pass 2: Sucesso Intermediário */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex p-4 rounded-full bg-verde-baby text-[#2d5a2d] mb-2 animate-[float_4s_ease-in-out_infinite]">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h2 className="font-display text-4xl text-[#2d5a2d] mb-2">Presença Confirmada!</h2>
              <p className="text-sm text-[#5a7a5a] max-w-sm mx-auto leading-relaxed">
                Ficamos muito felizes em saber que você e sua família estarão conosco para florir o 1º aninho da Emily Maria!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rosa-baby/20 border border-rosa-baby/30 text-left max-w-xs mx-auto">
              <p className="text-xs font-semibold text-[#8b4f60] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Detalhes confirmados:
              </p>
              <ul className="text-xs text-[#6b5880] space-y-1">
                <li>• Responsável: <strong>{chefe}</strong></li>
                <li>• Contato: <strong>{telefone}</strong></li>
                {acompanhantes.length > 0 && (
                  <li>• Acompanhantes: <strong>{acompanhantes.length} pessoa(s)</strong></li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="accent"
                onClick={() => setStep('gifts')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#b39ddb] to-[#c084fc] hover:from-[#9575cd] hover:to-[#a78bfa] text-white font-bold shadow-md hover:scale-105 transition-all duration-300"
              >
                <Gift className="w-5 h-5" />
                Ver Lista de Sugestão de Presentes
              </Button>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-[#8b7d99] hover:underline font-semibold"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

        {/* Pass 3: Lista de Presentes Interativa */}
        {step === 'gifts' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-[#5b6a9a] uppercase tracking-wider bg-azul-baby/40 px-3 py-1 rounded-full">
                Passo 2 de 2
              </span>
              <h2 className="font-display text-4xl text-[#3b4a7a] mt-3">Sugestões de Presentes</h2>
              <p className="text-xs text-[#6b5880] mt-2 max-w-xs mx-auto">
                Para facilitar, criamos uma listinha com algumas sugestões que a Emily Maria vai amar. Sinta-se livre para escolher um item para reservar!
              </p>
            </div>

            {/* Listagem de Presentes */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {gifts.map((gift) => {
                const isReserved = gift.reservedBy !== null;
                const isReservedByMe = gift.reservedBy === chefe;

                return (
                  <div
                    key={gift.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                      isReservedByMe
                        ? 'bg-verde-baby/20 border-verde-baby/60 shadow-xs'
                        : isReserved
                        ? 'bg-gray-50 border-gray-200/60 opacity-60'
                        : 'bg-white border-lilas-medium/40 hover:border-lilas-medium hover:shadow-xs'
                    }`}
                  >
                    <div className="flex-1 pr-3 text-left">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#8b7d99] bg-lilas-soft/50 px-2 py-0.5 rounded-md">
                        {gift.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#4a3e56] mt-1">{gift.name}</h4>
                      {isReserved && (
                        <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">
                          {isReservedByMe ? 'Reservado por você 💖' : 'Indisponível (Já escolhido)'}
                        </p>
                      )}
                    </div>

                    <div>
                      {isReservedByMe ? (
                        <button
                          type="button"
                          onClick={() => handleReserveGift(gift.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
                        >
                          Reservado ✓
                        </button>
                      ) : isReserved ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                          Reservado
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReserveGift(gift.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-rosa-baby hover:bg-[#ffb3c6] text-[#8b4f60] transition-colors border border-rosa-baby/40"
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedGiftId && (
              <div className="p-3.5 rounded-2xl bg-verde-baby/30 border border-verde-baby/50 text-center text-xs font-semibold text-[#2d5a2d] animate-fadeIn">
                Obrigado por escolher um presente! Salvamos sua escolha no convite. 🥰
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="w-full py-4 text-base bg-gradient-to-r from-rosa-baby to-azul-baby text-[#3b4a7a] font-bold shadow-md hover:scale-[1.02] transition-all"
              >
                Concluir Confirmação
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Toast de Notificação de Sucesso */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-verde-baby border border-[#b8f5b8]/80 text-[#2d5a2d] shadow-md animate-slide-down max-w-sm w-[90vw] text-left">
          <CheckCircle2 className="w-5 h-5 text-[#2d5a2d] shrink-0" />
          <div className="text-xs font-semibold leading-snug">
            Presença confirmada! Muito obrigado por celebrar o 1º aninho da Emily Maria conosco! 💖
          </div>
        </div>
      )}

      {/* Direitos Autorais */}
      <div className="relative z-10 mt-8 text-[10px] text-[#8b7d99] font-semibold tracking-wider uppercase opacity-85">
        © {new Date().getFullYear()}{' '}
        <a 
          href="https://ayran-vieira-dev.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#6b3040] underline transition-colors"
        >
          AV Soluções Digitais
        </a>
      </div>
    </div>
  );
}
