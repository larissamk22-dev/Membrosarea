'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [recuperar, setRecuperar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(
    params.get('erro') === 'sem-acesso'
      ? 'Sua conta não tem acesso ativo. Fale com a gente para reativar.'
      : null
  );

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
      if (error) {
        // Mensagem igual para e-mail inexistente e senha errada: contar qual
        // dos dois falhou entrega para um curioso quais e-mails são clientes.
        setErro('E-mail ou senha incorretos.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setErro('Não consegui entrar agora. Verifique sua conexão e tente de novo.');
    } finally {
      setCarregando(false);
    }
  }

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/definir-senha`,
      });
      if (error) {
        setErro('Não consegui enviar o e-mail agora. Tente de novo em instantes.');
        return;
      }
      setEnviado(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Lado da marca. Some no celular: ali o que importa é o formulário. */}
      <div
        className="relative hidden flex-col justify-between p-12 lg:flex"
        style={{ background: 'var(--superficie)' }}
      >
        <span className="font-display text-xl font-bold">Área de Membros</span>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Suas aulas,
            <br />
            no seu ritmo.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-suave">
            Entre com o e-mail que você usou na compra. Se for a primeira vez, use o link que
            enviamos para criar sua senha.
          </p>
        </div>
        <span className="text-xs" style={{ color: 'var(--texto-fraco)' }}>
          © {new Date().getFullYear()}
        </span>
      </div>

      {/* Lado do formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold">
            {recuperar ? 'Recuperar acesso' : 'Entrar'}
          </h1>
          <p className="mt-2 text-sm text-suave">
            {recuperar
              ? 'Enviamos um link para você criar uma senha nova.'
              : 'Que bom te ver de novo.'}
          </p>

          {enviado ? (
            <div className="cartao mt-7 space-y-2 p-4 text-sm text-suave">
              <p>
                Pronto. Se existir uma conta com esse e-mail, o link já está a caminho. Confira
                também a caixa de spam.
              </p>
              <p className="text-xs" style={{ color: 'var(--texto-fraco)' }}>
                Não chegou nada em alguns minutos? Peça um link de acesso novo para quem te
                matriculou — é mais rápido que esperar.
              </p>
            </div>
          ) : (
            <form onSubmit={recuperar ? enviarLink : entrar} className="mt-7 space-y-3">
              <div>
                <label htmlFor="email" className="etiqueta mb-1.5 block">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="campo"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {!recuperar && (
                <div>
                  <label htmlFor="senha" className="etiqueta mb-1.5 block">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="campo pr-16"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-suave hover:text-texto"
                    >
                      {mostrarSenha ? 'ocultar' : 'mostrar'}
                    </button>
                  </div>
                </div>
              )}

              {erro && (
                <p className="text-sm" style={{ color: '#E88B6E' }}>
                  {erro}
                </p>
              )}

              <button type="submit" disabled={carregando} className="botao w-full">
                {carregando ? 'Um instante...' : recuperar ? 'Enviar link' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecuperar((r) => !r);
                  setErro(null);
                }}
                className="w-full pt-1 text-center text-xs text-suave hover:text-texto"
              >
                {recuperar ? 'voltar para o login' : 'esqueci minha senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}
