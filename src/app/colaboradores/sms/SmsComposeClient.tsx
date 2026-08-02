'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Recipient {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  sexo: 'M' | 'F';
  direccion: string | null;
  barrio_nombre: string | null;
  comuna_nombre: string | null;
  puesto_nombre: string | null;
}

const PLACEHOLDERS = [
  { ph: '$nombre',          desc: 'nombre' },
  { ph: '$apellido',        desc: 'apellido' },
  { ph: '$nombre-completo', desc: 'nombre apellido' },
  { ph: '$o',               desc: 'o / a (género)' },
  { ph: '$a',               desc: '(nada) / a (género)' },
  { ph: '$sexo',            desc: 'hombre / mujer' },
  { ph: '$genero',          desc: 'masculino / femenino' },
  { ph: '$direccion',       desc: 'dirección' },
  { ph: '$barrio',          desc: 'barrio' },
  { ph: '$comuna',          desc: 'comuna' },
  { ph: '$puesto',          desc: 'puesto de votación' },
];

const SMS_LIMIT = 160;

export default function SmsComposeClient({ recipients }: { recipients: Recipient[] }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; failures?: { telefono: string; nombre: string; error: string }[] } | null>(null);
  const [error, setError] = useState('');

  const withPhone = recipients.filter(r => r.telefono?.trim());
  const withoutPhone = recipients.filter(r => !r.telefono?.trim());

  const chars = body.length;
  const segments = Math.ceil(chars / SMS_LIMIT) || 1;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!withPhone.length) return;
    setSending(true);
    setError('');
    setResult(null);

    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: withPhone, body }),
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

      <h1 className="text-2xl font-bold text-slate-800">Redactar SMS</h1>

      {/* Destinatarios */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Destinatarios ({withPhone.length} con teléfono)
        </h2>
        <div className="flex flex-wrap gap-2">
          {withPhone.map(r => (
            <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {r.nombre} {r.apellidos}
              <span className="text-green-400">· {r.telefono}</span>
            </span>
          ))}
        </div>
        {withoutPhone.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-amber-600 font-medium mb-1">
              Sin teléfono registrado (no recibirán el SMS):
            </p>
            <div className="flex flex-wrap gap-2">
              {withoutPhone.map(r => (
                <span key={r.id} className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                  {r.nombre} {r.apellidos}
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
                  <span className="font-medium">{f.nombre}</span> — {f.telefono}
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
        <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-slate-200">
          {PLACEHOLDERS.map(p => (
            <span key={p.ph} className="inline-flex items-center gap-1">
              <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{p.ph}</code>
              <span className="text-slate-500">{p.desc}</span>
            </span>
          ))}
        </div>
      </details>

      {/* Formulario */}
      {withPhone.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Ninguno de los colaboradores seleccionados tiene teléfono registrado.
        </div>
      ) : (
        <form onSubmit={handleSend} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Mensaje *</label>
              <span className={`text-xs ${chars > SMS_LIMIT ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                {chars} car. · {segments} SMS por destinatario
              </span>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={6}
              placeholder="Escribe aquí el mensaje..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Enviando...' : `Enviar a ${withPhone.length} colaboradores`}
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
