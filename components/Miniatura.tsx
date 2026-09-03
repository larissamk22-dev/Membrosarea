import { Lock, Play, Check } from 'lucide-react';

/**
 * A "carinha" da aula.
 *
 * Se você colou a imagem de capa do Panda Video em thumbnail_url, ela
 * aparece. Se não colou, em vez de um buraco cinza a gente desenha uma capa
 * a partir do próprio título — sempre a mesma cor para o mesmo título, então
 * cada aula tem a sua identidade e a tela nunca parece quebrada.
 */
function corDoTitulo(titulo: string) {
  let soma = 0;
  for (let i = 0; i < titulo.length; i++) soma = (soma + titulo.charCodeAt(i) * (i + 1)) % 360;
  return { de: `hsl(${soma} 42% 24%)`, para: `hsl(${(soma + 38) % 360} 38% 13%)` };
}

export function Miniatura({
  titulo,
  url,
  estado,
  numero,
}: {
  titulo: string;
  url: string | null;
  estado: 'disponivel' | 'travada' | 'concluida';
  numero?: number;
}) {
  const { de, para } = corDoTitulo(titulo);
  const travada = estado === 'travada';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-superficie2">
      {url ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover transition duration-300 ${
            travada ? 'scale-105 blur-[6px] brightness-[.4]' : 'group-hover:scale-[1.03]'
          }`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${travada ? 'brightness-[.55]' : ''}`}
          style={{ background: `linear-gradient(135deg, ${de}, ${para})` }}
        >
          {numero !== undefined && !travada && (
            <span className="font-display text-5xl font-bold text-white/12">
              {String(numero).padStart(2, '0')}
            </span>
          )}
        </div>
      )}

      {/* O símbolo do estado, sempre no mesmo lugar em todos os cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        {travada ? (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm">
            <Lock className="h-4 w-4 text-white/85" strokeWidth={2.2} />
          </span>
        ) : estado === 'concluida' ? (
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full opacity-0 transition group-hover:opacity-100"
            style={{ background: 'rgba(19,17,16,.7)' }}
          >
            <Play className="ml-0.5 h-4 w-4 fill-current text-white" />
          </span>
        ) : (
          <span
            className="flex h-11 w-11 scale-90 items-center justify-center rounded-full opacity-0 transition group-hover:scale-100 group-hover:opacity-100"
            style={{ background: 'var(--acento)' }}
          >
            <Play className="ml-0.5 h-4 w-4 fill-current" style={{ color: '#1A1206' }} />
          </span>
        )}
      </div>

      {estado === 'concluida' && (
        <span className="selo absolute left-2 top-2" style={{ color: 'var(--feito)' }}>
          <Check className="h-3 w-3" strokeWidth={3} /> assistida
        </span>
      )}
    </div>
  );
}
