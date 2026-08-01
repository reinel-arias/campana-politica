import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface Recipient {
  nombre: string;
  apellidos: string;
  email: string;
  sexo: 'M' | 'F';
}

function applyPlaceholders(text: string, r: Recipient): string {
  const f = r.sexo === 'F';
  return text
    .replace(/\$nombre-completo/g, `${r.nombre} ${r.apellidos}`)
    .replace(/\$apellido/g, r.apellidos)
    .replace(/\$nombre/g, r.nombre)
    .replace(/\$sexo/g, f ? 'mujer' : 'hombre')
    .replace(/\$genero/g, f ? 'femenina' : 'masculino')
    .replace(/\$o/g, f ? 'a' : 'o')
    .replace(/\$a/g, f ? 'a' : '');
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
          subject: applyPlaceholders(subject.trim(), r),
          text: applyPlaceholders(body.trim(), r),
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
