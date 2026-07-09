import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import FloatingButterflies from '../components/FloatingButterflies';
import { supabase, isSupabaseConfigured } from '../supabase';
import { User, Phone, ArrowLeft, Trash2, Gift, CheckCircle2, Download } from 'lucide-react';

const DEFAULT_GIFTS = [
  { id: 1, name: 'Roupinha de 1 a 2 anos, Sapato (Tam: 20 a 22) ou Brinquedos Educativos', limit: 20, category: 'Tamanho 1 a 2 anos' },
  { id: 2, name: 'Roupinha de 2 anos, Sapato (Tam: 22) ou Brinquedos Educativos', limit: 30, category: 'Tamanho 2 anos' },
  { id: 3, name: 'Roupinha de 2 a 3 anos, Sapato (Tam: 22 a 24) ou Brinquedos Educativos', limit: 30, category: 'Tamanho 2 a 3 anos' },
  { id: 4, name: 'Roupinha de 3 anos, Sapato (Tam: 23) ou Brinquedos Educativos', limit: 20, category: 'Tamanho 3 anos' },
  { id: 5, name: 'Contribuição via Pix', limit: 9999, category: 'Presente em Dinheiro' }
];

export default function AcessoConfirmacao() {
  const navigate = useNavigate();
  
  // Login states
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Logged in user data
  const [guest, setGuest] = useState(null);
  
  // Gifts logic states
  const [showGifts, setShowGifts] = useState(false);
  const [allGuestsForGifts, setAllGuestsForGifts] = useState([]);
  
  // Notification toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const loadGiftReservations = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('party_guests').select('reservedGiftId');
        if (!error && data) setAllGuestsForGifts(data);
      } catch (err) {}
    } else {
      const saved = localStorage.getItem('party_guests');
      if (saved) setAllGuestsForGifts(JSON.parse(saved));
    }
  };

  useEffect(() => {
    if (guest && showGifts) {
      loadGiftReservations();
    }
  }, [guest, showGifts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    
    if (!email.trim() || !telefone.trim()) {
      setErrorLogin('Por favor, preencha e-mail e telefone.');
      return;
    }

    setIsLoading(true);
    const cleanPhoneInput = telefone.replace(/\D/g, '');
    const cleanEmailInput = email.trim().toLowerCase();

    let foundGuest = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('party_guests')
          .select('*')
          .ilike('email', cleanEmailInput);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          foundGuest = data.find(g => (g.telefone || '').replace(/\D/g, '') === cleanPhoneInput);
        }
      } catch (err) {
        console.error("Erro na busca no Supabase:", err);
      }
    } 

    if (!foundGuest) {
      // Fallback para localStorage
      const savedGuests = localStorage.getItem('party_guests');
      if (savedGuests) {
        const guestsList = JSON.parse(savedGuests);
        foundGuest = guestsList.find(g => 
          g.email.toLowerCase() === cleanEmailInput && 
          (g.telefone || '').replace(/\D/g, '') === cleanPhoneInput
        );
      }
    }

    setIsLoading(false);

    if (foundGuest) {
      setGuest(foundGuest);
      // Salva no localStorage para uso do cartão caso precisem baixar dnv
      localStorage.setItem('current_guest_id', foundGuest.id);
    } else {
      setErrorLogin('Confirmação não encontrada. Verifique se o e-mail e telefone estão corretos ou se você já confirmou presença.');
    }
  };

  const removeAcompanhante = async (indexToRemove) => {
    if (!window.confirm('Tem certeza que deseja remover este acompanhante?')) return;
    
    const updatedAcompanhantes = guest.acompanhantes.filter((_, i) => i !== indexToRemove);
    const updatedGuest = { ...guest, acompanhantes: updatedAcompanhantes };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('party_guests')
          .update({ acompanhantes: updatedAcompanhantes })
          .eq('id', guest.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Erro ao remover acompanhante:", err);
        alert('Não foi possível remover no banco online (verifique as permissões de UPDATE no Supabase). A alteração será salva apenas localmente.');
      }
    }

    // Atualiza Local Storage
    const savedGuests = localStorage.getItem('party_guests');
    if (savedGuests) {
      let guestsList = JSON.parse(savedGuests);
      guestsList = guestsList.map(g => g.id === guest.id ? updatedGuest : g);
      localStorage.setItem('party_guests', JSON.stringify(guestsList));
    }

    setGuest(updatedGuest);
    setToastMessage('Acompanhante removido com sucesso!');
    setShowToast(true);
  };

  const getGiftReservationsCount = (giftId) => {
    return allGuestsForGifts.filter(g => g.reservedGiftId === giftId).length;
  };

  const handleReserveGift = async (giftId) => {
    const isRemoving = guest.reservedGiftId === giftId;
    const selectedGift = DEFAULT_GIFTS.find(g => g.id === giftId);

    if (!isRemoving && selectedGift) {
      const count = getGiftReservationsCount(giftId);
      if (count >= selectedGift.limit) {
        alert(`A sugestão "${selectedGift.category}" já atingiu o limite de ${selectedGift.limit} marcações.`);
        return;
      }
    }

    const reservedGiftIdValue = isRemoving ? null : giftId;
    const reservedGiftNameValue = isRemoving ? null : (selectedGift ? selectedGift.name : null);
    
    const updatedGuest = { 
      ...guest, 
      reservedGiftId: reservedGiftIdValue, 
      reservedGift: reservedGiftNameValue 
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('party_guests')
          .update({
            reservedGiftId: reservedGiftIdValue,
            reservedGift: reservedGiftNameValue
          })
          .eq('id', guest.id);

        if (error) throw error;
      } catch (err) {
        console.error("Erro ao salvar presente:", err);
        alert('Não foi possível salvar no banco online (verifique as permissões de UPDATE no Supabase). A alteração será salva apenas localmente no seu dispositivo.');
      }
    }

    const savedGuests = localStorage.getItem('party_guests');
    if (savedGuests) {
      let guestsList = JSON.parse(savedGuests);
      guestsList = guestsList.map(g => g.id === guest.id ? updatedGuest : g);
      localStorage.setItem('party_guests', JSON.stringify(guestsList));
    }

    setGuest(updatedGuest);
    loadGiftReservations();
    
    if (isRemoving) {
      setToastMessage('Sua escolha de presente foi removida.');
    } else {
      setToastMessage('Sua escolha de presente foi atualizada! 🥰');
      setShowGifts(false);
    }
    setShowToast(true);
  };

  const handleDownloadCard = () => {
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

    const giftText = guest.reservedGift 
      ? guest.reservedGift 
      : 'Nenhuma sugestão marcada (Livre)';

    const pixHtml = guest.reservedGiftId === 5 
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
        
        {!guest ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-[#8b4f60] uppercase tracking-wider bg-rosa-baby/30 px-3 py-1 rounded-full">
                Acesso
              </span>
              <h2 className="font-display text-4xl text-[#6b3040] mt-3">Minha Confirmação</h2>
              <p className="text-xs text-[#8b7d99] mt-2 max-w-xs mx-auto">
                Para acessar sua confirmação de presença, digite o e-mail e telefone cadastrados.
              </p>
            </div>

            {errorLogin && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-500 text-xs text-center rounded-xl font-medium">
                {errorLogin}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="E-mail do Responsável"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              <Input
                label="Telefone de Contato"
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate('/')} type="button" className="flex-1 py-3.5">
                  Voltar
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 py-3.5">
                  {isLoading ? 'Buscando...' : 'Acessar'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#2d5a2d] uppercase tracking-wider bg-verde-baby px-2 py-1 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Presença Confirmada
                </span>
                <h2 className="font-display text-3xl text-[#4a3e56] mt-2">Olá, {guest.chefe}</h2>
              </div>
              <button 
                onClick={() => setGuest(null)} 
                className="p-2 rounded-full bg-lilas-soft/50 text-[#6b5880] hover:bg-lilas-medium/50 transition-colors"
                title="Sair"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-lilas-medium/30 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#8b7d99] uppercase tracking-wider mb-2">Acompanhantes</h3>
                {guest.acompanhantes && guest.acompanhantes.length > 0 ? (
                  <ul className="space-y-2">
                    {guest.acompanhantes.map((acomp, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-[#f9f5ff] p-2 rounded-lg border border-[#e6d5f7]">
                        <span className="text-sm text-[#4a3e56] font-medium">
                          {acomp.name} {acomp.isChild && <span className="text-[10px] bg-azul-baby text-[#2c5364] px-1.5 py-0.5 rounded-full ml-1">Criança</span>}
                        </span>
                        <button 
                          onClick={() => removeAcompanhante(idx)}
                          className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-md transition-colors"
                          title="Remover acompanhante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#b0a7b8] italic">Sem acompanhantes adicionais.</p>
                )}
              </div>

              <div className="pt-4 border-t border-dashed border-lilas-medium/40">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-[#8b7d99] uppercase tracking-wider">Presente Escolhido</h3>
                  {guest.reservedGift && (
                    <button 
                      onClick={() => setShowGifts(!showGifts)}
                      className="text-[10px] font-bold text-[#6b3040] hover:underline bg-rosa-baby/30 px-2 py-1 rounded-md"
                    >
                      {showGifts ? 'Cancelar' : 'Trocar Presente'}
                    </button>
                  )}
                </div>
                {!showGifts && (
                  guest.reservedGift ? (
                    <div className="flex flex-col gap-2">
                      <div className="p-3 bg-[#e8f5e9]/50 border border-[#a5d6a7] rounded-xl flex items-start gap-2">
                        <Gift className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[#2d5a2d]">
                          {guest.reservedGift}
                        </span>
                      </div>
                      {guest.reservedGiftId === 5 && (
                        <div className="p-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl mt-1">
                          <p className="text-[10px] font-bold text-[#0284c7] mb-0.5">DADOS DO PIX:</p>
                          <p className="text-sm font-bold text-[#0369a1] mb-0.5">(85)9 8539-8517</p>
                          <p className="text-[10px] text-[#0ea5e9] leading-tight">PicPay<br/>Ayran Vieira dos Reis Cruz</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <Button onClick={() => setShowGifts(true)} variant="primary" className="py-2.5 px-6 shadow-md bg-gradient-to-r from-rosa-baby to-[#ffc0cb] text-[#6b3040] font-bold">
                        🎁 Adicionar Presente
                      </Button>
                    </div>
                  )
                )}
              </div>

              {showGifts && (
                <div className="pt-2 animate-fadeIn space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {DEFAULT_GIFTS.map(gift => {
                    const count = getGiftReservationsCount(gift.id);
                    const isSelectedByMe = guest.reservedGiftId === gift.id;
                    const isLimitReached = count >= gift.limit;
                    const isReservedByAnother = guest.reservedGiftId != null && !isSelectedByMe;

                    return (
                      <div key={gift.id} className={`p-3 rounded-xl border flex flex-col gap-2 ${isSelectedByMe ? 'bg-verde-baby/20 border-verde-baby/60' : isLimitReached ? 'bg-gray-50 border-gray-200/50 opacity-60' : 'bg-white border-lilas-medium/30'}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-[#6b5880]">{gift.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#4a3e56]">{gift.name}</h4>
                        <div className="flex justify-end mt-1">
                          {isSelectedByMe ? (
                            <button onClick={() => handleReserveGift(gift.id)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]">
                              Remover (Desfazer)
                            </button>
                          ) : isLimitReached ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400">Esgotado</span>
                          ) : (
                            <button disabled={isReservedByAnother} onClick={() => handleReserveGift(gift.id)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-rosa-baby text-[#8b4f60] disabled:opacity-40">
                              Escolher
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button onClick={handleDownloadCard} variant="primary" className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rosa-baby to-azul-baby text-[#3b4a7a] font-bold shadow-md">
                <Download className="w-4 h-4" />
                Baixar Cartão de Confirmação
              </Button>
              <button onClick={() => navigate('/')} className="text-xs text-[#8b7d99] hover:underline font-semibold w-full text-center">
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-verde-baby border border-[#b8f5b8]/80 text-[#2d5a2d] shadow-md animate-slide-down max-w-sm w-[90vw] text-left">
          <CheckCircle2 className="w-5 h-5 text-[#2d5a2d] shrink-0" />
          <div className="text-xs font-semibold leading-snug">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
