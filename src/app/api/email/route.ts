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
      host: 'smtp-relay.brevo.com',
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
          from: `"Campaña Política" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
          to: `${r.apellidos}, ${r.nombre} <${r.email}>`,
          subject: subject.trim(),
          text: body.trim(),
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ sent, failed });
  } catch (error) {
    console.error('[email]', error);
    return NextResponse.json({ error: 'Error al enviar correos' }, { status: 500 });
  }
}
