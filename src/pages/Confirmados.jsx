import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FloatingButterflies from '../components/FloatingButterflies';
import { Users, Phone, Mail, Calendar, Trash2, Search, ArrowLeft, Gift, UserPlus, Download, Sparkles, LayoutGrid, List } from 'lucide-react';

export default function Confirmados() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Estados para Adicionar Convidado Manualmente (Painel do Organizador)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChefe, setNewChefe] = useState('');
  const [newTelefone, setNewTelefone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAcompText, setNewAcompText] = useState(''); // Separado por vírgula para ser rápido no admin
  const [formError, setFormError] = useState('');

  // Carregar dados
  useEffect(() => {
    const savedGuests = localStorage.getItem('party_guests');
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }
  }, []);

  // Remover convidado
  const handleRemoveGuest = (id) => {
    if (window.confirm('Deseja realmente remover esta confirmação?')) {
      const guestToRemove = guests.find(g => g.id === id);
      const updatedGuests = guests.filter(g => g.id !== id);
      setGuests(updatedGuests);
      localStorage.setItem('party_guests', JSON.stringify(updatedGuests));

      // Se esse convidado reservou um presente, precisamos liberá-lo na lista de presentes
      if (guestToRemove && guestToRemove.reservedGift) {
        const savedGifts = localStorage.getItem('party_gifts');
        if (savedGifts) {
          const gifts = JSON.parse(savedGifts);
          const updatedGifts = gifts.map(gift => {
            if (gift.reservedBy === guestToRemove.chefe) {
              return { ...gift, reservedBy: null };
            }
            return gift;
          });
          localStorage.setItem('party_gifts', JSON.stringify(updatedGifts));
        }
      }
    }
  };

  // Adicionar convidado manualmente
  const handleAddManualGuest = (e) => {
    e.preventDefault();
    if (!newChefe.trim() || !newTelefone.trim() || !newEmail.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const acompNames = newAcompText
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .slice(0, 4); // Limite de 4 acompanhantes

    const parsedAcompanhantes = acompNames.map(name => {
      const lowercaseName = name.toLowerCase();
      const isChild = lowercaseName.includes('(criança)') || 
                      lowercaseName.includes('(crianca)') || 
                      lowercaseName.includes('(menor de 6)') || 
                      lowercaseName.includes('(menor de 6a)') || 
                      lowercaseName.includes('<6') ||
                      lowercaseName.includes('< 6');
                      
      const cleanedName = name
        .replace(/\(criança\)/gi, '')
        .replace(/\(crianca\)/gi, '')
        .replace(/\(menor de 6\)/gi, '')
        .replace(/\(menor de 6a\)/gi, '')
        .replace(/<6/gi, '')
        .replace(/< 6/gi, '')
        .trim();

      return { name: cleanedName, isChild };
    });

    const newGuest = {
      id: Date.now().toString(),
      chefe: newChefe.trim(),
      telefone: newTelefone.trim(),
      email: newEmail.trim(),
      acompanhantes: parsedAcompanhantes,
      confirmedAt: new Date().toISOString(),
      reservedGift: null
    };

    const updatedGuests = [...guests, newGuest];
    setGuests(updatedGuests);
    localStorage.setItem('party_guests', JSON.stringify(updatedGuests));

    // Limpar formulário
    setNewChefe('');
    setNewTelefone('');
    setNewEmail('');
    setNewAcompText('');
    setFormError('');
    setShowAddModal(false);
  };

  // Exportar para JSON/Texto (Download)
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(guests, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `confirmados_aniversario_emily_maria_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtrar convidados
  const filteredGuests = guests.filter(guest => 
    guest.chefe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guest.acompanhantes && guest.acompanhantes.some(a => {
      const name = typeof a === 'object' ? a.name : a;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    }))
  );

  // Estatísticas
  const totalFamilias = guests.length;
  const totalPessoas = guests.reduce((acc, curr) => acc + 1 + (curr.acompanhantes?.length || 0), 0);
  const totalCriancas = guests.reduce((acc, curr) => {
    const kidsCount = curr.acompanhantes?.filter(a => typeof a === 'object' && a.isChild).length || 0;
    return acc + kidsCount;
  }, 0);
  const totalAdultos = totalPessoas - totalCriancas;
  const totalPresentesReservados = guests.filter(g => g.reservedGift).length;

  return (
    <div className="relative min-h-screen px-4 py-8 md:py-12 bg-gradient-to-b from-[#faf6fe] via-[#f7f3fb] to-[#f4f7fa]">
      <FloatingButterflies count={8} />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Topbar / Voltar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-semibold text-[#6b5880] hover:text-[#4a3e56] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2"
              disabled={guests.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar Lista
            </Button>
            
            <Button
              variant="accent"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#b39ddb] text-white hover:bg-[#9575cd]"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Manualmente
            </Button>
          </div>
        </div>

        {/* Cabeçalho */}
        <div className="text-center">
          <span className="text-xs font-bold text-[#5b6a9a] uppercase tracking-wider bg-azul-baby/40 px-3 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Painel do Organizador
          </span>
          <h1 className="font-display text-5xl text-[#6b3040] mt-3">Convidados Confirmados</h1>
          <p className="text-sm text-[#8b7d99] mt-1">
            Gerencie as presenças e sugestões de presentes reservadas para o 1º aninho da Emily Maria.
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-5 rounded-3xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-lilas-soft text-[#6b5880]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8b7d99] font-bold uppercase tracking-wider">Total Confirmados</p>
              <h3 className="text-2xl font-bold text-[#4a3e56]">{totalPessoas}</h3>
              <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">Famílias: {totalFamilias}</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rosa-baby/40 text-[#8b4f60]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8b7d99] font-bold uppercase tracking-wider">Adultos (Pagantes)</p>
              <h3 className="text-2xl font-bold text-[#4a3e56]">{totalAdultos}</h3>
              <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">Acima de 6 anos</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-azul-baby/40 text-[#2c5364]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8b7d99] font-bold uppercase tracking-wider">Crianças (Isentas)</p>
              <h3 className="text-2xl font-bold text-[#4a3e56]">{totalCriancas}</h3>
              <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">Menores de 6 anos</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-verde-baby/40 text-[#2d5a2d]">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#8b7d99] font-bold uppercase tracking-wider">Presentes</p>
              <h3 className="text-2xl font-bold text-[#4a3e56]">{totalPresentesReservados}</h3>
              <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">Reservados</p>
            </div>
          </div>
        </div>

        {/* Filtros e Alternador de Modo de Exibição */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0a7b8]" />
            <input
              type="text"
              placeholder="Buscar por responsável ou acompanhante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-lilas-medium focus:border-[#c084fc] focus:ring-2 focus:ring-lilas-soft outline-none transition-all duration-300 text-sm text-[#4a3e56] shadow-inner"
            />
          </div>

          {/* Botões Alternadores de Exibição */}
          <div className="flex bg-white/60 backdrop-blur-xs p-1 rounded-2xl border border-lilas-medium/40 shadow-xxs shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-rosa-baby text-[#8b4f60] shadow-xxs'
                  : 'text-[#8b7d99] hover:text-[#6b5880]'
              }`}
              title="Exibição em Grid (Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-azul-baby text-[#2c5364] shadow-xxs'
                  : 'text-[#8b7d99] hover:text-[#6b5880]'
              }`}
              title="Exibição em Listagem (Tabela)"
            >
              <List className="w-3.5 h-3.5" />
              Listagem
            </button>
          </div>
        </div>

        {/* Exibição dos Dados */}
        {filteredGuests.length > 0 ? (
          <>
            {/* Visualização em Grid (Cards) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredGuests.map((guest) => (
                  <div 
                    key={guest.id} 
                    className="group relative overflow-hidden rounded-3xl bg-white/80 border border-lilas-medium/40 p-5 shadow-xs hover:shadow-md hover:border-[#c084fc]/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Faixa decorativa superior */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rosa-baby via-lilas-soft to-azul-baby"></div>

                    <div className="space-y-4">
                      {/* Nome do Chefe */}
                      <div className="flex justify-between items-start gap-2 pt-2">
                        <div className="text-left">
                          <h4 className="font-bold text-base text-[#4a3e56] group-hover:text-[#6b3040] transition-colors">
                            {guest.chefe}
                          </h4>
                          <p className="text-[10px] text-[#8b7d99] mt-0.5 font-medium">
                            Confirmado em: {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')} às {new Date(guest.confirmedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveGuest(guest.id)}
                          className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Excluir confirmação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Informações de contato */}
                      <div className="text-xs space-y-2 border-y border-lilas-medium/30 py-3 text-left text-[#6b5880]">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#8b7d99]" />
                          <span>{guest.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                          <Mail className="w-3.5 h-3.5 text-[#8b7d99] shrink-0" />
                          <span className="truncate" title={guest.email}>{guest.email}</span>
                        </div>
                      </div>

                      {/* Acompanhantes */}
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-[#4a3e56] mb-1.5 flex items-center gap-1.5">
                          <span>Integrantes da Família</span>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd1dc]/45 text-[#6b3040]">
                            {1 + (guest.acompanhantes?.length || 0)}
                          </span>
                        </h5>
                        {guest.acompanhantes && guest.acompanhantes.length > 0 ? (
                          <ul className="text-xs text-[#6b5880] space-y-1.5 pl-2 border-l border-lilas-medium">
                            <li className="font-semibold text-[#4a3e56]">• {guest.chefe} (Titular)</li>
                            {guest.acompanhantes.map((acomp, idx) => {
                              const isChild = typeof acomp === 'object' && acomp.isChild;
                              const name = typeof acomp === 'object' ? acomp.name : acomp;
                              return (
                                <li key={idx} className="flex items-center gap-1.5 justify-between">
                                  <span>• {name}</span>
                                  {isChild && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-azul-baby/45 text-[#2c5364] flex items-center gap-0.5" title="Isento no buffet (Menor de 6 anos)">
                                      👶 Criança
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-xs text-[#b0a7b8] italic pl-2 border-l border-lilas-medium">
                            Apenas o responsável titular.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Presente reservado se houver */}
                    {guest.reservedGift ? (
                      <div className="mt-4 pt-3 border-t border-dashed border-lilas-medium/40 text-left flex items-start gap-2 text-xs text-[#2e7d32] bg-[#e8f5e9]/40 p-2.5 rounded-2xl">
                        <Gift className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[10px] uppercase tracking-wider text-[#388e3c]">Presente Reservado:</p>
                          <p className="font-semibold text-xs mt-0.5 leading-snug">{guest.reservedGift}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-dashed border-lilas-medium/40 text-left flex items-start gap-2 text-xs text-gray-400 bg-gray-50/50 p-2.5 rounded-2xl">
                        <Gift className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Presente:</p>
                          <p className="italic text-xs mt-0.5">Nenhum presente reservado.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Visualização em Listagem (Tabela) */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto w-full bg-white/70 backdrop-blur-md rounded-3xl border border-lilas-medium/40 shadow-xs animate-fadeIn">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-lilas-soft/50 text-[#6b5880] text-xs font-bold border-b border-lilas-medium/30">
                      <th className="p-4">Responsável</th>
                      <th className="p-4">Acompanhantes</th>
                      <th className="p-4 text-center">Total</th>
                      <th className="p-4">Contato</th>
                      <th className="p-4">Presente Escolhido</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lilas-medium/20 text-sm text-[#4a3e56]">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-4 font-bold">
                          {guest.chefe}
                          <span className="block text-[10px] text-[#8b7d99] font-normal mt-0.5">
                            Confirmado em: {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#6b5880] max-w-[200px]">
                          {guest.acompanhantes && guest.acompanhantes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {guest.acompanhantes.map((acomp, idx) => {
                                const isChild = typeof acomp === 'object' && acomp.isChild;
                                const name = typeof acomp === 'object' ? acomp.name : acomp;
                                return (
                                  <span key={idx} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md border text-[10px] ${
                                    isChild 
                                      ? 'bg-azul-baby/20 border-azul-baby/40 text-[#2c5364]' 
                                      : 'bg-white border-lilas-medium/25 text-[#4a3e56]'
                                  }`}>
                                    {isChild && '👶 '}
                                    {name}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="italic text-[#b0a7b8]">Apenas Titular</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-xs">
                          {(() => {
                            const total = 1 + (guest.acompanhantes?.length || 0);
                            const kids = guest.acompanhantes?.filter(a => typeof a === 'object' && a.isChild).length || 0;
                            const adults = total - kids;
                            return (
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#ffd1dc]/40 text-[#6b3040] font-bold">
                                  {total}
                                </span>
                                <span className="text-[9px] text-[#8b7d99] font-medium leading-none whitespace-nowrap">
                                  ({adults} ad. + {kids} cr.)
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-xs space-y-0.5">
                          <div className="font-semibold">{guest.telefone}</div>
                          <div className="text-[#8b7d99]">{guest.email}</div>
                        </td>
                        <td className="p-4">
                          {guest.reservedGift ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2d5a2d] bg-[#e8f5e9] px-2.5 py-1 rounded-full border border-[#a5d6a7]">
                              <Gift className="w-3 h-3 text-[#2d5a2d] shrink-0" />
                              {guest.reservedGift}
                            </span>
                          ) : (
                            <span className="text-xs text-[#b0a7b8] italic">Nenhum</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleRemoveGuest(guest.id)}
                            className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                            title="Remover Confirmação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center bg-white/40 border border-white/60 rounded-3xl backdrop-blur-md">
            <Users className="w-12 h-12 text-[#b0a7b8] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#4a3e56]">Nenhum convidado encontrado</h3>
            <p className="text-sm text-[#8b7d99] mt-1">
              {searchTerm ? 'Tente buscar por outro nome de responsável ou acompanhante.' : 'As confirmações aparecerão aqui assim que os convidados preencherem o formulário.'}
            </p>
          </div>
        )}

      </div>

      {/* Modal para Adicionar Convidado Manualmente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-lilas-medium/50 p-6 shadow-2xl relative animate-scaleUp">
            <h3 className="font-display text-3xl text-[#6b3040] mb-4 text-center">Adicionar Convidado</h3>
            
            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddManualGuest} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-[#6b5880] mb-1 block">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  value={newChefe}
                  onChange={(e) => setNewChefe(e.target.value)}
                  placeholder="Nome do chefe da família"
                  className="w-full px-4 py-2.5 rounded-xl border border-lilas-medium focus:border-[#c084fc] outline-none text-sm text-[#4a3e56]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#6b5880] mb-1 block">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={newTelefone}
                    onChange={(e) => setNewTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-lilas-medium focus:border-[#c084fc] outline-none text-sm text-[#4a3e56]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6b5880] mb-1 block">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-lilas-medium focus:border-[#c084fc] outline-none text-sm text-[#4a3e56]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6b5880] mb-1 block">
                  Acompanhantes (máx 4 - separados por vírgula)
                </label>
                <input
                  type="text"
                  value={newAcompText}
                  onChange={(e) => setNewAcompText(e.target.value)}
                  placeholder="Ex: Julia Silva, Arthur Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-lilas-medium focus:border-[#c084fc] outline-none text-sm text-[#4a3e56]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 py-2.5"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direitos Autorais */}
      <div className="relative z-10 mt-12 text-center text-[10px] text-[#8b7d99] font-semibold tracking-wider uppercase opacity-85">
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
