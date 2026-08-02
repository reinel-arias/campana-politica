import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

interface Recipient {
  nombre: string;
  apellidos: string;
  telefono: string;
  sexo: 'M' | 'F';
  direccion: string | null;
  barrio_nombre: string | null;
  comuna_nombre: string | null;
  puesto_nombre: string | null;
}

function applyPlaceholders(text: string, r: Recipient): string {
  const f = r.sexo === 'F';
  return text
    .replace(/\$nombre-completo/g, `${r.nombre} ${r.apellidos}`)
    .replace(/\$apellido/g, r.apellidos)
    .replace(/\$nombre/g, r.nombre)
    .replace(/\$sexo/g, f ? 'mujer' : 'hombre')
    .replace(/\$genero/g, f ? 'femenino' : 'masculino')
    .replace(/\$o/g, f ? 'a' : 'o')
    .replace(/\$a/g, f ? 'a' : '')
    .replace(/\$direccion/g, r.direccion ?? '')
    .replace(/\$barrio/g, r.barrio_nombre ?? '')
    .replace(/\$comuna/g, r.comuna_nombre ?? '')
    .replace(/\$puesto/g, r.puesto_nombre ?? '');
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  return `${process.env.SMS_COUNTRY_CODE ?? '+57'}${cleaned}`;
}

export async function POST(req: NextRequest) {
  try {
    const { recipients, body } = await req.json() as {
      recipients: Recipient[];
      body: string;
    };

    if (!recipients?.length || !body?.trim()) {
      return NextResponse.json({ error: 'Faltan destinatarios o mensaje' }, { status: 400 });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const delayMs = parseInt(process.env.SMS_DELAY_MS ?? '500', 10);
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const results: PromiseSettledResult<unknown>[] = [];
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      if (i > 0 && delayMs > 0) await sleep(delayMs);
      const result = await client.messages.create({
        body: applyPlaceholders(body.trim(), r),
        from: process.env.TWILIO_FROM!,
        to: formatPhone(r.telefono),
      }).then(v => ({ status: 'fulfilled' as const, value: v }))
        .catch(e => ({ status: 'rejected' as const, reason: e }));
      results.push(result);
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failures = results
      .map((r, i) => r.status === 'rejected'
        ? { telefono: recipients[i].telefono, nombre: `${recipients[i].nombre} ${recipients[i].apellidos}`, error: (r as PromiseRejectedResult).reason?.message ?? 'Error desconocido' }
        : null)
      .filter(Boolean);

    if (failures.length > 0) {
      console.error('[sms] Fallos al enviar:', JSON.stringify(failures, null, 2));
    }

    return NextResponse.json({ sent, failed: failures.length, failures });
  } catch (error) {
    console.error('[sms]', error);
    return NextResponse.json({ error: 'Error al enviar SMS' }, { status: 500 });
  }
}
