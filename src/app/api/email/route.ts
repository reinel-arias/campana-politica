import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface Recipient {
  nombre: string;
  apellidos: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { recipients, subject, body } = await req.json() as {
      recipients: Recipient[];
      subject: string;
      body: string;
    };

    if (!recipients?.length || !subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Faltan destinatarios, asunto o mensaje' }, { status: 400 });
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

    const results = await Promise.allSettled(
      recipients.map(r =>
        transporter.sendMail({
          from: `"Anuncios Pereira" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
          to: `${r.apellidos}, ${r.nombre} <${r.email}>`,
          subject: subject.trim(),
          text: body.trim(),
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failures = results
      .map((r, i) => r.status === 'rejected'
        ? { email: recipients[i].email, nombre: `${recipients[i].apellidos}, ${recipients[i].nombre}`, error: (r as PromiseRejectedResult).reason?.message ?? 'Error desconocido' }
        : null)
      .filter(Boolean);

    if (failures.length > 0) {
      console.error('[email] Fallos al enviar:', JSON.stringify(failures, null, 2));
    }

    return NextResponse.json({ sent, failed: failures.length, failures });
  } catch (error) {
    console.error('[email]', error);
    return NextResponse.json({ error: 'Error al enviar correos' }, { status: 500 });
  }
}
