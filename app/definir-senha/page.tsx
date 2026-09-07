'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * Onde a aluna cria a senha dela.
 *
 * Esta página existe por causa de um detalhe do navegador que decide tudo: o
 * link de acesso do Supabase volta com os dados da sessão DEPOIS do "#", no
 * que se chama fragmento — e fragmento é a única parte do endereço que o
 * navegador jamais envia ao servidor. Por isso a leitura tem que acontecer
 * aqui, no lado de quem clicou. Uma rota de servidor receberia a mão vazia.
 *
 * E ela existe também por um motivo mais simples: sem esta tela a aluna
 * entraria uma vez, sem senha nenhuma, e na próxima visita estaria travada
 * de novo.
 */
export default function DefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [valido, setValido] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Pega a sessão que veio no fragmento e limpa o endereço, para a senha da
  // aluna não ficar num link que ela possa colar em qualquer lugar depois.
  useEffect(() => {
    const supabase = createClient();

    async function abrir() {
      const frag = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // O Supabase avisa link vencido ou já usado pelo próprio endereço.
      // Vale mais dizer isso do que mostrar um formulário que não vai salvar.
      if (frag.get('error') || frag.get('error_code')) {
        window.history.replaceState({}, '', '/definir-senha');
        setValido(false);
        setPronto(true);
        return;
      }

      const access_token = frag.get('access_token');
      const refresh_token = frag.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) {
          window.history.replaceState({}, '', '/definir-senha');
          setValido(true);
          setPronto(true);
          return;
        }
      }

      // Sem fragmento: pode ser alguém já logada abrindo a página para trocar
      // a senha. Isso é legítimo.
      const { data } = await supabase.auth.getSession();
      setValido(Boolean(data.session));
      setPronto(true);
    }

    abrir();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirma) {
      setErro('As duas senhas não são iguais.');
      return;
    }

    setSalvando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro('Não consegui salvar a senha. Peça um link novo e tente de novo.');
      return;
    }

    router.push('/aulas');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {!pronto ? (
          <p className="flex items-center justify-center gap-2 text-sm text-suave">
            <Loader2 className="h-4 w-4 animate-spin" /> abrindo…
          </p>
        ) : !valido ? (
          <div className="cartao space-y-3 p-6 text-center">
            <h1 className="font-display text-2xl font-bold">Link expirado</h1>
            <p className="text-sm leading-relaxed text-suave">
              Este link de acesso já foi usado ou passou da validade. Peça um novo para quem
              te matriculou — leva um minuto.
            </p>
            <a href="/login" className="botao-fantasma !py-2 !text-xs">
              voltar para o login
            </a>
          </div>
        ) : (
          <form onSubmit={salvar} className="cartao space-y-4 p-6">
            <div>
              <h1 className="font-display text-2xl font-bold">Crie sua senha</h1>
              <p className="mt-1 text-sm text-suave">
                É com ela que você vai entrar daqui em diante.
              </p>
            </div>

            <div>
              <label className="etiqueta mb-1.5 block">Nova senha</label>
              <div className="relative">
                <input
                  className="campo"
                  type={mostrar ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="pelo menos 8 caracteres"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrar((m) => !m)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-suave hover:text-texto"
                  aria-label={mostrar ? 'esconder senha' : 'mostrar senha'}
                >
                  {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="etiqueta mb-1.5 block">Repita a senha</label>
              <input
                className="campo"
                type={mostrar ? 'text' : 'password'}
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                required
              />
            </div>

            {erro && (
              <p className="text-sm" style={{ color: '#E88B6E' }}>
                {erro}
              </p>
            )}

            <button type="submit" disabled={salvando} className="botao w-full">
              {salvando ? 'salvando…' : 'salvar e entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
