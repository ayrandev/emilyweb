import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FloatingButterflies from '../components/FloatingButterflies';
import { Calendar, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const PHOTOS = [
  { url: '/1.jpeg', alt: 'Momento Especial 1' },
  { url: '/2.jpeg', alt: 'Momento Especial 2' },
  { url: '/3.jpeg', alt: 'Momento Especial 3' },
  { url: '/4.jpeg', alt: 'Momento Especial 4' },
  { url: '/5.jpeg', alt: 'Momento Especial 5' },
  { url: '/6.jpeg', alt: 'Momento Especial 6' },
  { url: '/7.jpeg', alt: 'Momento Especial 7' },
  { url: '/8.jpeg', alt: 'Momento Especial 8' },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Efeito para passar as fotos reais automaticamente no carrossel
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4500); // Passagem suave das fotos do card a cada 4.5 segundos

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === PHOTOS.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? PHOTOS.length - 1 : prevIndex - 1));
  };

  const selectSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between pb-12 bg-[#faf6fe]">
      {/* Borboletas flutuantes em segundo plano */}
      <FloatingButterflies count={12} />

      {/* HERO SECTION com Imagem de Jardim no Fundo */}
      <header className="relative w-full min-h-[50vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 py-16">
        
        {/* Imagem de Fundo Estática de Jardim e Borboletas */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/bg_jardim.jpg"
            alt="Fundo de Jardim Encantado"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Overlay de Degradê Suave */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf6fe]/10 via-[#faf6fe]/40 to-[#faf6fe] z-10"></div>
        </div>

        {/* Conteúdo do Hero (Por cima do jardim) */}
        <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center animate-[sway_10s_ease-in-out_infinite]">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rosa-baby/50 border border-rosa-baby/70 text-xs font-bold text-[#8b4f60] mb-4 backdrop-blur-xxs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Você está convidado!
          </div>
          
          <h1 className="font-display text-7xl md:text-9xl text-[#6b3040] leading-none mb-1 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]">
            Jardim Encantado
          </h1>
          <p className="font-display text-5xl md:text-6xl text-[#5b6a9a] mb-2 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]">
            da Emily Maria
          </p>
          <span className="inline-block px-4 py-1.5 rounded-full bg-rosa-baby/85 border border-rosa-baby/90 text-xs font-bold text-[#8b4f60] uppercase tracking-widest mb-6 shadow-xxs animate-[sway_6s_ease-in-out_infinite]">
            🌸 1º Aninho 🌸
          </span>
          <p className="text-sm md:text-base text-[#4a3e56] max-w-lg mx-auto leading-relaxed font-semibold px-4">
            Parece que foi ontem que você chegou para colorir o nosso mundo e transformar a nossa vida em um jardim repleto de amor. 
            Ver você crescer é como contemplar a mais linda borboleta ganhando asas para voar. 
            <span className="block mt-4 text-[#6b3040] text-base md:text-lg font-bold leading-normal">
              Com muita gratidão, convidamos você para fazer parte deste momento único e especial, celebrando o 1º aninho da nossa pequena Emily Maria!
            </span>
          </p>
        </div>
      </header>

      {/* SEÇÃO PRINCIPAL: Slideshow das Fotos do Usuário em Card Separado */}
      <main className="relative z-20 w-full max-w-3xl px-4 -mt-8 mb-8">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-3xl border-8 border-white shadow-lg hover:shadow-xl transition-shadow duration-500 bg-white">
          
          {/* Slides de Fotos Reais */}
          {PHOTOS.map((photo, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={photo.url}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {isActive && (
                  <div className="w-full h-full relative flex items-center justify-center bg-[#faf6fe]/50">
                    {/* Imagem de Fundo Desfocada para preencher laterais de fotos verticais/retângulos de proporções diferentes */}
                    <img
                      src={photo.url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-105 select-none pointer-events-none"
                    />
                    {/* Imagem Nítida e Inteira (Sem corte nas cabeças ou pés, se adaptando a fotos verticais) */}
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="relative max-w-full max-h-full object-contain z-10 select-none pointer-events-none animate-kenburns"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Sombra suave interna sobre as imagens */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-20"></div>

          {/* Controles do Carrossel: Seta Esquerda */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/75 hover:bg-white text-[#6b3040] shadow-sm hover:scale-105 transition-all duration-300 backdrop-blur-xxs"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Controles do Carrossel: Seta Direita */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/75 hover:bg-white text-[#6b3040] shadow-sm hover:scale-105 transition-all duration-300 backdrop-blur-xxs"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Controles Inferiores: Pause/Play e Indicadores */}
          <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#6b3040] shadow-xs hover:scale-105 transition-all backdrop-blur-xxs"
              title={isPlaying ? 'Pausar Carrossel' : 'Iniciar Carrossel'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Indicadores (Dots) */}
            <div className="flex gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-xxs">
              {PHOTOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Informações da foto ativa */}
        <div className="text-center mt-3 text-xs text-[#8b7d99] font-medium">
          Foto {currentIndex + 1} de {PHOTOS.length} {isPlaying ? '(passando automaticamente)' : '(pausado)'}
        </div>
      </main>

      {/* Seção Inferior: Detalhes e Ações */}
      <footer className="relative z-20 w-full max-w-3xl px-4 flex flex-col items-center">
        
        {/* Caixa de detalhes (Glassmorphism) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full p-6 rounded-3xl bg-white/60 border border-white/90 backdrop-blur-md shadow-md mb-8 text-[#4a3e56]">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rosa-baby/30 border border-rosa-baby/40 shadow-xxs">
            <Calendar className="w-6 h-6 text-[#8b4f60] mb-2" />
            <span className="text-xs font-bold text-[#8b4f60] uppercase tracking-wider">Data</span>
            <span className="text-sm font-semibold mt-1">Sábado, 29 de Agosto</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-azul-baby/30 border border-azul-baby/40 shadow-xxs">
            <Clock className="w-6 h-6 text-[#3a6475] mb-2" />
            <span className="text-xs font-bold text-[#3a6475] uppercase tracking-wider">Horário</span>
            <span className="text-sm font-semibold mt-1">A partir das 17:00h</span>
          </div>

          <a 
            href="https://share.google/uSWwQwf87RTfTSNtt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-verde-baby/30 border border-verde-baby/40 shadow-xxs hover:bg-verde-baby/45 hover:scale-[1.03] transition-all duration-300 group cursor-pointer text-center"
            title="Ver localização no Google Maps"
          >
            <MapPin className="w-6 h-6 text-[#3c6b3c] mb-2 group-hover:animate-bounce" />
            <span className="text-xs font-bold text-[#3c6b3c] uppercase tracking-wider">Local</span>
            <span className="text-sm font-semibold mt-0.5">Lalu Eventos</span>
            <span className="text-[10px] text-[#4a3e56]/90 font-bold mt-0.5 underline decoration-dotted group-hover:text-[#2d5a2d] transition-colors">
              Av. Bernardo Manuel, 12.982
            </span>
          </a>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-4">
          <Button 
            variant="primary" 
            onClick={() => navigate('/confirmar')}
            className="text-base px-10 py-4 shadow-md bg-gradient-to-r from-rosa-baby to-[#ffc0cb] text-[#6b3040] hover:scale-105 transition-all duration-300"
          >
            Confirmar Presença
          </Button>
          <span className="text-xs text-[#8b7d99] font-medium">
            Por favor, confirme sua presença até o dia 22/08
          </span>
        </div>

        {/* Direitos Autorais */}
        <div className="mt-12 text-[10px] text-[#8b7d99] font-semibold tracking-wider uppercase opacity-85">
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
      </footer>
    </div>
  );
}
