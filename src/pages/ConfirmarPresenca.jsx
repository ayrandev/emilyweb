import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import FloatingButterflies from '../components/FloatingButterflies';
import { User, Phone, Mail, Plus, Trash2, CheckCircle2, Gift, Sparkles, ArrowRight, ArrowLeft, Download } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

const DEFAULT_GIFTS = [
  { 
    id: 1, 
    name: 'Roupinha de 1 a 2 anos, Sapato (Tam: 20 a 22) ou Brinquedos Educativos', 
    limit: 20,
    category: 'Tamanho 1 a 2 anos' 
  },
  { 
    id: 2, 
    name: 'Roupinha de 2 anos, Sapato (Tam: 22) ou Brinquedos Educativos', 
    limit: 30,
    category: 'Tamanho 2 anos' 
  },
  { 
    id: 3, 
    name: 'Roupinha de 2 a 3 anos, Sapato (Tam: 22 a 24) ou Brinquedos Educativos', 
    limit: 30,
    category: 'Tamanho 2 a 3 anos' 
  },
  { 
    id: 4, 
    name: 'Roupinha de 3 anos, Sapato (Tam: 23) ou Brinquedos Educativos', 
    limit: 20,
    category: 'Tamanho 3 anos' 
  },
  { 
    id: 5, 
    name: 'Contribuição via Pix', 
    limit: 9999,
    category: 'Presente em Dinheiro' 
  }
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

  // Lista de presentes e seleção
  const [selectedGiftId, setSelectedGiftId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [allGuestsForGifts, setAllGuestsForGifts] = useState([]); // Reservas gerais de presentes

  // Auto-fechamento do Toast de notificação
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Carrega a escolha anterior do usuário se existir no localStorage e as reservas totais no banco
  useEffect(() => {
    const fetchReservations = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('party_guests')
            .select('reservedGiftId');
          if (error) throw error;
          setAllGuestsForGifts(data || []);
        } catch (err) {
          console.error("Erro ao buscar reservas de presentes:", err.message);
        }
      } else {
        const savedGuests = localStorage.getItem('party_guests');
        if (savedGuests) {
          setAllGuestsForGifts(JSON.parse(savedGuests));
        }
      }
    };

    if (step === 'gifts') {
      fetchReservations();
      const currentGuestId = localStorage.getItem('current_guest_id');
      const savedGuests = localStorage.getItem('party_guests');
      if (currentGuestId && savedGuests) {
        const guestsList = JSON.parse(savedGuests);
        const currentGuest = guestsList.find(g => g.id === currentGuestId);
        if (currentGuest && currentGuest.reservedGiftId) {
          setSelectedGiftId(currentGuest.reservedGiftId);
        }
      }
    }
  }, [step]);

  const addAcompanhante = () => {
    if (acompanhantes.length < 4) {
      setAcompanhantes([...acompanhantes, { name: '', isChild: false }]);
    }
  };

  const removeAcompanhante = (index) => {
    const newAcompanhantes = acompanhantes.filter((_, i) => i !== index);
    setAcompanhantes(newAcompanhantes);
  };

  const normalizeGiftId = (value) => String(value ?? '');

  const parseSelectedGiftIds = (value) => {
    if (Array.isArray(value)) {
      return value.map(normalizeGiftId).filter(Boolean);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeGiftId).filter(Boolean);
        }
      } catch (_) {}

      return trimmed
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(normalizeGiftId);
    }

    if (value !== null && value !== undefined) {
      return [normalizeGiftId(value)].filter(Boolean);
    }

    return [];
  };

  const getGiftReservationsCount = (giftId) => {
    const normalizedGiftId = normalizeGiftId(giftId);
    return allGuestsForGifts.reduce((count, guestData) => {
      return count + parseSelectedGiftIds(guestData?.reservedGiftId).filter(id => normalizeGiftId(id) === normalizedGiftId).length;
    }, 0);
  };

  const handleAcompanhanteChange = (index, field, value) => {
    const newAcompanhantes = [...acompanhantes];
    newAcompanhantes[index] = { ...newAcompanhantes[index], [field]: value };
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
      if (!acomp.name || !acomp.name.trim()) {
        tempErrors[`acomp_${idx}`] = 'Preencha o nome do acompanhante ou remova-o';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newGuest = {
      chefe: chefe.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      acompanhantes: acompanhantes
        .map(a => ({ name: a.name.trim(), isChild: a.isChild }))
        .filter(a => a.name),
      confirmedAt: new Date().toISOString(),
      reservedGift: null
    };

    let guestId = Date.now().toString();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('party_guests')
          .insert([newGuest])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          guestId = data[0].id.toString();
          newGuest.id = guestId;
        }
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err.message);
        alert("Ocorreu um erro ao enviar sua confirmação online. Tentaremos continuar localmente.");
        newGuest.id = guestId;
      }
    } else {
      newGuest.id = guestId;
    }

    // Salvar convidado no localStorage para o cartão de confirmação local funcionar
    const savedGuests = localStorage.getItem('party_guests');
    const guestsList = savedGuests ? JSON.parse(savedGuests) : [];
    guestsList.push(newGuest);
    localStorage.setItem('party_guests', JSON.stringify(guestsList));
    localStorage.setItem('current_guest_id', guestId);
    
    // Ir para tela de sucesso intermediária
    setStep('success');
    setShowToast(true);
  };

  const handleReserveGift = async (giftId) => {
    const currentGuestId = localStorage.getItem('current_guest_id');
    const savedGuests = localStorage.getItem('party_guests');
    const guestsList = savedGuests ? JSON.parse(savedGuests) : [];
    const guestIndex = guestsList.findIndex(g => g.id === currentGuestId);
    
    if (guestIndex === -1) return;

    const selectedGiftIds = parseSelectedGiftIds(guestsList[guestIndex]?.reservedGiftId);
    const normalizedGiftId = normalizeGiftId(giftId);
    const isRemoving = selectedGiftIds.includes(normalizedGiftId);
    const selectedGift = DEFAULT_GIFTS.find(g => normalizeGiftId(g.id) === normalizedGiftId);

    if (!isRemoving && selectedGift) {
      if (selectedGiftIds.length >= 2) {
        alert('Você pode escolher até 2 presentes.');
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('party_guests')
            .select('id');

          if (error) throw error;
          const reservationsCount = (data || []).reduce((count, guestData) => {
            return count + parseSelectedGiftIds(guestData?.reservedGiftId).filter(id => normalizeGiftId(id) === normalizedGiftId).length;
          }, 0);

          if (reservationsCount >= selectedGift.limit) {
            alert(`A sugestão "${selectedGift.category}" já atingiu o limite de ${selectedGift.limit} marcações. Por favor, escolha outra opção!`);
            return;
          }
        } catch (err) {
          console.error("Erro ao validar limite do presente:", err.message);
        }
      } else {
        const reservationsCount = guestsList.reduce((count, guestData) => {
          return count + parseSelectedGiftIds(guestData?.reservedGiftId).filter(id => normalizeGiftId(id) === normalizedGiftId).length;
        }, 0);
        if (reservationsCount >= selectedGift.limit) {
          alert(`A sugestão "${selectedGift.category}" já atingiu o limite de ${selectedGift.limit} marcações. Por favor, escolha outra opção!`);
          return;
        }
      }
    }

    const nextSelectedGiftIds = isRemoving
      ? selectedGiftIds.filter(id => normalizeGiftId(id) !== normalizedGiftId)
      : [...selectedGiftIds, normalizedGiftId].filter(Boolean);

    const reservedGiftIdValue = nextSelectedGiftIds.length > 0 ? JSON.stringify(nextSelectedGiftIds) : null;
    const reservedGiftNameValue = nextSelectedGiftIds.length > 0
      ? nextSelectedGiftIds
          .map(id => DEFAULT_GIFTS.find(gift => normalizeGiftId(gift.id) === normalizeGiftId(id)))
          .filter(Boolean)
          .map(gift => gift.name)
          .join(' • ')
      : null;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('party_guests')
          .update({
            reservedGiftId: reservedGiftIdValue,
            reservedGift: reservedGiftNameValue
          })
          .eq('id', currentGuestId);

        if (error) throw error;
      } catch (err) {
        console.error("Erro ao salvar presente no Supabase:", err.message);
        alert("Não foi possível salvar no banco online (verifique as permissões de UPDATE no Supabase). A alteração será salva apenas localmente.");
      }
    }

    // Salvar localmente
    guestsList[guestIndex].reservedGiftId = reservedGiftIdValue;
    guestsList[guestIndex].reservedGift = reservedGiftNameValue;
    guestsList[guestIndex].reservedGiftIds = nextSelectedGiftIds;
    setSelectedGiftId(nextSelectedGiftIds.length > 0 ? nextSelectedGiftIds[0] : null);
    localStorage.setItem('party_guests', JSON.stringify(guestsList));

    // Atualizar visualização do contador em tempo real
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('party_guests')
          .select('reservedGiftId');
        if (!error && data) {
          setAllGuestsForGifts(data);
        }
      } catch (e) {}
    } else {
      setAllGuestsForGifts(guestsList);
    }
  };

  const handleDownloadCard = () => {
    const currentGuestId = localStorage.getItem('current_guest_id');
    const savedGuests = localStorage.getItem('party_guests');
    if (!currentGuestId || !savedGuests) return;

    const guestsList = JSON.parse(savedGuests);
    const guest = guestsList.find(g => g.id === currentGuestId);
    if (!guest) return;

    const acompListHtml = guest.acompanhantes && guest.acompanhantes.length > 0
      ? `<div class="section">
          <div class="section-title">Acompanhantes</div>
          <div class="content" style="font-size: 13px;">
            ${guest.acompanhantes.map(a => `
              <div class="acomp-item" style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>• ${a.name}</span>
                ${a.isChild ? `<span class="acomp-child" style="font-size: 10px; background: #d4f0fc; color: #2c5364; padding: 1px 6px; border-radius: 8px; font-weight: bold;">Criança</span>` : ''}
              </div>
            `).join('')}
          </div>
         </div>`
      : '';

    const selectedGiftIds = parseSelectedGiftIds(guest?.reservedGiftId);
    const giftText = selectedGiftIds.length > 0
      ? selectedGiftIds
          .map(id => DEFAULT_GIFTS.find(gift => normalizeGiftId(gift.id) === normalizeGiftId(id)))
          .filter(Boolean)
          .map(gift => gift.name)
          .join(' • ')
      : 'Nenhuma sugestão marcada (Livre)';

    const pixHtml = selectedGiftIds.includes(normalizeGiftId(5))
      ? `<div class="section" style="background-color: #f0f9ff; border: 1px dashed #bae6fd; border-radius: 8px; padding: 10px; margin-top: 10px;">
          <div class="section-title" style="color: #0284c7; margin-bottom: 2px;">Dados do Pix</div>
          <div class="content" style="font-size: 13px; color: #0369a1;">
            <strong>Chave (Celular):</strong> (85)9 8539-8517<br>
            <strong>Instituição:</strong> PicPay<br>
            <strong>Nome:</strong> Ayran Vieira dos Reis Cruz
          </div>
         </div>`
      : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cartão de Confirmação - Emily Maria</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #faf6fe; color: #4a3e56; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 3px dashed #c084fc; border-radius: 24px; padding: 30px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(107, 88, 128, 0.15); text-align: center; position: relative; }
    .card::before { content: '🦋'; font-size: 24px; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #faf6fe; padding: 0 10px; }
    h1 { font-family: Georgia, serif; color: #6b3040; margin-bottom: 5px; font-size: 24px; }
    .tag { display: inline-block; background: #ffd1dc; color: #8b4f60; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; margin-bottom: 20px; }
    .section { border-top: 1px solid #eee; padding: 15px 0; text-align: left; }
    .section-title { font-size: 11px; font-weight: bold; color: #8b7d99; text-transform: uppercase; margin-bottom: 6px; }
    .content { font-size: 14px; font-weight: 600; color: #4a3e56; }
    .footer-info { font-size: 11px; color: #8b7d99; font-style: italic; margin-top: 15px; border-top: 1px dashed #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Jardim Encantado</h1>
    <div class="tag">🌸 Emily Maria - 1º Aninho 🌸</div>
    
    <div class="section">
      <div class="section-title">Convidado Responsável</div>
      <div class="content">${guest.chefe}</div>
    </div>
    
    ${acompListHtml}
    
    <div class="section">
      <div class="section-title">Presente Escolhido</div>
      <div class="content">${giftText}</div>
      ${pixHtml}
    </div>
    
    <div class="section">
      <div class="section-title">Detalhes do Evento</div>
      <div class="content" style="font-size: 13px;">
        📅 Sábado, 29 de Agosto às 17h<br>
        📍 Lalu Eventos<br>
        🗺️ Av. Bernardo Manuel, 12.982
      </div>
    </div>
    
    <div class="footer-info">
      Apresente este cartão digital na entrada do evento. Esperamos por você! ✨
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
    downloadAnchor.setAttribute("download", `confirmacao_emily_maria_${guest.chefe.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
                  <div className="space-y-4 mt-2">
                    {acompanhantes.map((acomp, index) => (
                      <div key={index} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/45 border border-lilas-medium/20 animate-fadeIn">
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder={`Nome do acompanhante ${index + 1}`}
                            value={acomp.name || ''}
                            onChange={(e) => handleAcompanhanteChange(index, 'name', e.target.value)}
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
                        <label className="flex items-center gap-2 text-[10px] text-[#6b5880] font-semibold pl-1 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acomp.isChild || false}
                            onChange={(e) => handleAcompanhanteChange(index, 'isChild', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#8b4f60] focus:ring-[#8b4f60] accent-rosa-baby"
                          />
                          <span>Menor de 6 anos (criança)</span>
                        </label>
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
                  <li>
                    • Acompanhantes: <strong>{acompanhantes.length} pessoa(s)</strong>
                    {acompanhantes.filter(a => a.isChild).length > 0 && (
                      <span className="text-[10px] text-[#2d5a2d] block font-semibold pl-2">
                        └ {acompanhantes.filter(a => a.isChild).length} criança(s) menor(es) de 6 anos
                      </span>
                    )}
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="accent"
                onClick={() => setStep('gifts')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#b39ddb] to-[#c084fc] hover:from-[#9575cd] hover:to-[#a78bfa] text-white font-bold shadow-md hover:scale-[1.02] transition-all duration-300"
              >
                <Gift className="w-5 h-5" />
                Ver Lista de Sugestão de Presentes
              </Button>
              
              <Button
                variant="primary"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rosa-baby to-azul-baby text-[#3b4a7a] font-bold shadow-xs hover:scale-[1.02] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-[#3b4a7a]" />
                Ver Cartão de Confirmação
              </Button>

              <button
                onClick={() => navigate('/')}
                className="text-xs text-[#8b7d99] hover:underline font-semibold block w-full text-center pt-1"
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
              <h2 className="font-display text-4xl text-[#3b4a7a] mt-3">Sugestão de Presentes</h2>
              <p className="text-xs text-[#6b5880] mt-2 max-w-xs mx-auto">
                Para facilitar, disponibilizamos as opções e tamanhos sugeridos abaixo. Escolha um item para fazer a sua marcação!
              </p>
            </div>

            {/* Listagem de Presentes Simples com Limites */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin text-left">
              {DEFAULT_GIFTS.map((gift) => {
                const count = getGiftReservationsCount(gift.id);
                const selectedGiftIds = parseSelectedGiftIds(localStorage.getItem('party_guests') ? JSON.parse(localStorage.getItem('party_guests')).find(g => g.id === localStorage.getItem('current_guest_id'))?.reservedGiftId : null);
                const isSelectedByMe = selectedGiftIds.includes(normalizeGiftId(gift.id));
                const isLimitReached = count >= gift.limit;
                const canSelect = !isSelectedByMe && !isLimitReached && selectedGiftIds.length < 2;

                return (
                  <div
                    key={gift.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                      isSelectedByMe
                        ? 'bg-verde-baby/20 border-verde-baby/60 shadow-xs'
                        : isLimitReached
                        ? 'bg-gray-50 border-gray-200/50 opacity-60'
                        : 'bg-white border-lilas-medium/30 hover:border-lilas-medium hover:shadow-xxs'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#8b7d99] bg-lilas-soft/50 px-2.5 py-0.5 rounded-md">
                          {gift.category}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          isLimitReached ? 'text-red-400' : 'text-[#6b5880]'
                        }`}>
                          Escolhas: {count} de {gift.limit}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#4a3e56] mt-2.5 leading-snug">
                        {gift.name}
                      </h4>
                    </div>

                    <div className="flex justify-end pt-1">
                      {isSelectedByMe ? (
                        <button
                          type="button"
                          onClick={() => handleReserveGift(gift.id)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                        >
                          Reservado ✓ (Desfazer)
                        </button>
                      ) : isLimitReached ? (
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200/50">
                          Esgotado
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canSelect}
                          onClick={() => handleReserveGift(gift.id)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-rosa-baby hover:bg-[#ffb3c6] text-[#8b4f60] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rosa-baby border border-rosa-baby/40 transition-colors"
                        >
                          {selectedGiftIds.length >= 2 ? 'Limite atingido' : 'Escolher'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedGiftId && (
              <div className="p-3.5 rounded-2xl bg-verde-baby/30 border border-verde-baby/50 text-center text-xs font-semibold text-[#2d5a2d] animate-fadeIn">
                Obrigado pela sua escolha! Salvamos as suas marcações no convite. 🥰
              </div>
            )}

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-4 text-base bg-gradient-to-r from-rosa-baby to-azul-baby text-[#3b4a7a] font-bold shadow-md hover:scale-[1.02] transition-all"
              >
                Concluir Confirmação
              </Button>
              
              {!selectedGiftId && (
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadCard();
                    navigate('/');
                  }}
                  className="w-full py-3 text-xs text-[#6b5880] font-bold hover:text-[#4a3e56] border border-dashed border-lilas-medium/40 hover:border-lilas-medium rounded-2xl bg-white/40 hover:bg-lilas-soft/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5 text-[#8b7d99]" />
                  Apenas Baixar Cartão (Sem Presente)
                </button>
              )}
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

      {/* Modal de Checkout / Cartão de Confirmação */}
      {showCheckoutModal && (() => {
        const currentGuestId = localStorage.getItem('current_guest_id');
        const savedGuests = localStorage.getItem('party_guests');
        if (!currentGuestId || !savedGuests) return null;
        
        const guestsList = JSON.parse(savedGuests);
        const guest = guestsList.find(g => g.id === currentGuestId);
        if (!guest) return null;

        const giftText = guest.reservedGift ? guest.reservedGift : 'Nenhuma sugestão marcada (Livre)';

        return (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl border border-lilas-medium/50 p-6 shadow-2xl relative animate-scaleUp text-center space-y-5">
              
              <div>
                <span className="text-[10px] font-bold text-[#8b4f60] uppercase tracking-wider bg-rosa-baby/40 px-3 py-1 rounded-full">
                  Confirmação Concluída
                </span>
                <h3 className="font-display text-3xl text-[#6b3040] mt-3">Seu Cartão Digital</h3>
                <p className="text-[10px] text-[#8b7d99] mt-0.5">
                  Veja a prévia do seu bilhete de confirmação abaixo.
                </p>
              </div>

              {/* Bilhete estilizado */}
              <div className="relative border-2 border-dashed border-[#c084fc]/40 rounded-2xl p-4 bg-[#faf6fe]/60 text-left space-y-3.5 shadow-inner overflow-hidden">
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white border border-[#c084fc]/15"></div>
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-white border border-[#c084fc]/15"></div>
                
                <div>
                  <h4 className="text-[9px] font-bold text-[#8b7d99] uppercase tracking-wider">Responsável</h4>
                  <p className="text-sm font-bold text-[#4a3e56] mt-0.5">{guest.chefe}</p>
                </div>

                {guest.acompanhantes && guest.acompanhantes.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold text-[#8b7d99] uppercase tracking-wider">Acompanhantes</h4>
                    <ul className="text-xs text-[#6b5880] mt-1 space-y-1">
                      {guest.acompanhantes.map((acomp, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-white/50 px-2 py-0.5 rounded-lg border border-lilas-medium/10">
                          <span>• {acomp.name}</span>
                          {acomp.isChild && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-azul-baby/40 text-[#2c5364]">
                              👶 Criança
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-[#c084fc]/20 pt-2.5">
                  <h4 className="text-[9px] font-bold text-[#8b7d99] uppercase tracking-wider">Sugestão de Presente</h4>
                  <p className="text-xs font-bold text-[#2e7d32] mt-0.5 leading-snug">{giftText}</p>
                  {guest.reservedGiftId === 5 && (
                    <div className="mt-2 p-2 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg">
                      <p className="text-[10px] font-bold text-[#0284c7] mb-0.5">DADOS DO PIX:</p>
                      <p className="text-xs font-bold text-[#0369a1] mb-0.5">(85)9 8539-8517</p>
                      <p className="text-[10px] text-[#0ea5e9] leading-tight">PicPay<br/>Ayran Vieira dos Reis Cruz</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-[#c084fc]/20 pt-2.5 text-[10px] text-[#6b5880] space-y-0.5">
                  <p>📅 <strong>Sábado, 29 de Agosto</strong> às <strong>17h</strong></p>
                  <p>📍 <strong>Lalu Eventos</strong> (Av. Bernardo Manuel, 12.982)</p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-2 pt-1.5">
                <Button
                  variant="primary"
                  onClick={handleDownloadCard}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rosa-baby to-[#ffc0cb] text-[#6b3040] font-bold shadow-md hover:scale-[1.02] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Baixar Cartão de Confirmação
                </Button>
                
                {!selectedGiftId && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setStep('gifts');
                    }}
                    className="w-full py-2.5 text-xs text-[#6b3040] font-bold hover:underline bg-[#faf6fe] border border-lilas-medium/30 rounded-xl transition-all"
                  >
                    🎁 Ver Sugestão de Presentes
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    navigate('/');
                  }}
                  className="w-full py-2.5 text-xs text-[#8b7d99] font-bold hover:underline"
                >
                  Concluir e Fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

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
