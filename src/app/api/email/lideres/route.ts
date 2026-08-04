import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface Recipient {
  nombre: string;
  apellidos: string;
  email: string;
  subject: string;
  body: string;
}

export async function POST(req: NextRequest) {
  try {
    const { recipients } = await req.json() as { recipients: Recipient[] };

    if (!recipients?.length) {
      return NextResponse.json({ error: 'Faltan destinatarios' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const delayMs = parseInt(process.env.EMAIL_DELAY_MS ?? '200', 10);
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const results: PromiseSettledResult<unknown>[] = [];
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      if (i > 0 && delayMs > 0) await sleep(delayMs);
      const result = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME ?? 'Anuncios'}" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to: `${r.nombre} ${r.apellidos} <${r.email}>`,
        subject: r.subject,
        text: r.body,
      }).then(v => ({ status: 'fulfilled' as const, value: v }))
        .catch(e => ({ status: 'rejected' as const, reason: e }));
      results.push(result);
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failures = results
      .map((r, i) => r.status === 'rejected'
        ? { email: recipients[i].email, nombre: `${recipients[i].nombre} ${recipients[i].apellidos}`, error: (r as PromiseRejectedResult).reason?.message ?? 'Error desconocido' }
        : null)
      .filter(Boolean);

    if (failures.length > 0) {
      console.error('[email/lideres] Fallos:', JSON.stringify(failures, null, 2));
    }

    return NextResponse.json({ sent, failed: failures.length, failures });
  } catch (error) {
    console.error('[email/lideres]', error);
    return NextResponse.json({ error: 'Error al enviar correos' }, { status: 500 });
  }
}
