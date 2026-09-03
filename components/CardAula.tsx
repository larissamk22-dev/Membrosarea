import Link from 'next/link';
import { Miniatura } from './Miniatura';
import { duracao, dataCurta } from '@/lib/formato';
import type { Aula } from '@/lib/tipos';

/**
 * Um card de aula tem TRÊS estados, e é importante que os três tenham
 * exatamente o mesmo tamanho e o mesmo lugar para cada informação — é isso
 * que faz a grade parecer organizada em vez de remendada.
 *
 *   disponível  → clica e abre
 *   concluída   → clica e abre, com o selo de assistida
 *   travada     → não clica, capa borrada, e a data no lugar da duração
 */
export function CardAula({
  aula,
  numero,
  concluida,
}: {
  aula: Aula;
  numero: number;
  concluida: boolean;
}) {
  const travada = !aula.liberado;
  const estado = travada ? 'travada' : concluida ? 'concluida' : 'disponivel';
  const quando = dataCurta(aula.libera_em);

  const conteudo = (
    <>
      <Miniatura titulo={aula.titulo} url={aula.thumbnail_url} estado={estado} numero={numero} />
      <div className="mt-3">
        <h3
          className={`font-display text-[15px] font-semibold leading-snug ${
            travada ? 'text-suave' : 'text-texto'
          }`}
        >
          {aula.titulo}
        </h3>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--texto-fraco)' }}>
          {travada
            ? quando
              ? `libera em ${quando}`
              : 'em breve'
            : [duracao(aula.duracao_segundos), concluida ? 'assistida' : null]
                .filter(Boolean)
                .join(' · ')}
        </p>
      </div>
    </>
  );

  if (travada) {
    // Sem <a>: não é clicável, e não fica no caminho de quem navega por teclado.
    return <div className="cursor-default select-none opacity-75">{conteudo}</div>;
  }

  return (
    <Link href={`/aulas/${aula.id}`} className="group block rounded-xl">
      {conteudo}
    </Link>
  );
}
