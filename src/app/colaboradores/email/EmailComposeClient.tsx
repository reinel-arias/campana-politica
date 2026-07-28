'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Recipient {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
}

export default function EmailComposeClient({ recipients }: { recipients: Recipient[] }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  const withEmail = recipients.filter(r => r.email?.trim());
  const withoutEmail = recipients.filter(r => !r.email?.trim());

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!withEmail.length) return;
    setSending(true);
    setError('');
    setResult(null);

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: withEmail, subject, body }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? 'Error al enviar');
      return;
    }
    setResult(data);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/colaboradores" className="text-blue-600 hover:underline text-sm">
          ← Colaboradores
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Redactar Email</h1>

      {/* Destinatarios */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Destinatarios ({withEmail.length} con email)
        </h2>
        <div className="flex flex-wrap gap-2">
          {withEmail.map(r => (
            <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {r.apellidos}, {r.nombre}
              <span className="text-blue-400">· {r.email}</span>
            </span>
          ))}
        </div>
        {withoutEmail.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-amber-600 font-medium mb-1">
              Sin email registrado (no recibirán el mensaje):
            </p>
            <div className="flex flex-wrap gap-2">
              {withoutEmail.map(r => (
                <span key={r.id} className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                  {r.apellidos}, {r.nombre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          ✓ Enviado a <strong>{result.sent}</strong> colaboradores
          {result.failed > 0 && <span className="text-red-600"> · {result.failed} fallaron</span>}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Formulario */}
      {withEmail.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Ninguno de los colaboradores seleccionados tiene email registrado.
        </div>
      ) : (
        <form onSubmit={handleSend} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asunto *</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              maxLength={200}
              placeholder="Asunto del correo..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={10}
              placeholder="Escribe aquí el mensaje..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !subject.trim() || !body.trim()}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando...' : `Enviar a ${withEmail.length} colaboradores`}
            </button>
            <Link
              href="/colaboradores"
              className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
