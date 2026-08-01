'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Recipient {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  sexo: 'M' | 'F';
  direccion: string | null;
  barrio_nombre: string | null;
  comuna_nombre: string | null;
  puesto_nombre: string | null;
}

const PLACEHOLDERS = [
  { ph: '$nombre',          m: 'nombre',         f: 'nombre' },
  { ph: '$apellido',        m: 'apellido',        f: 'apellido' },
  { ph: '$nombre-completo', m: 'nombre apellido', f: 'nombre apellido' },
  { ph: '$o',               m: 'o',               f: 'a' },
  { ph: '$a',               m: '(nada)',           f: 'a' },
  { ph: '$sexo',            m: 'hombre',           f: 'mujer' },
  { ph: '$genero',          m: 'masculino',        f: 'femenino' },
  { ph: '$direccion',       m: 'dirección',        f: 'dirección' },
  { ph: '$barrio',          m: 'barrio',           f: 'barrio' },
  { ph: '$comuna',          m: 'comuna',           f: 'comuna' },
  { ph: '$puesto',          m: 'puesto votación',  f: 'puesto votación' },
];

export default function EmailComposeClient({ recipients }: { recipients: Recipient[] }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; failures?: { email: string; nombre: string; error: string }[] } | null>(null);
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

    setSending(false);

    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      setError(`Error del servidor (${res.status} ${res.statusText}). Revisa la consola del servidor.`);
      return;
    }

    if (!res.ok) {
      setError((data.error as string) ?? 'Error al enviar');
      return;
    }
    setResult(data as never);
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
        <div className="space-y-2">
          {result.sent > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
              ✓ Enviado correctamente a <strong>{result.sent}</strong> colaboradores
            </div>
          )}
          {result.failures && result.failures.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm space-y-2">
              <p className="font-semibold text-red-700">Fallaron {result.failures.length} envíos:</p>
              {result.failures.map((f, i) => (
                <div key={i} className="text-red-600">
                  <span className="font-medium">{f.nombre}</span> — {f.email}
                  <p className="text-xs text-red-400 mt-0.5">{f.error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Referencia de placeholders */}
      <details className="bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <summary className="px-4 py-2.5 cursor-pointer font-medium text-slate-600 select-none">
          Placeholders disponibles
        </summary>
        <table className="w-full border-t border-slate-200">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-4 py-2 font-semibold">Placeholder</th>
              <th className="px-4 py-2 font-semibold">Masculino</th>
              <th className="px-4 py-2 font-semibold">Femenino</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PLACEHOLDERS.map(p => (
              <tr key={p.ph}>
                <td className="px-4 py-1.5 font-mono text-blue-700">{p.ph}</td>
                <td className="px-4 py-1.5 text-slate-600">{p.m}</td>
                <td className="px-4 py-1.5 text-slate-600">{p.f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

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
