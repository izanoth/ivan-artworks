import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nome, e-mail e mensagem são obrigatórios.' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = 'ivanzanoth@gmail.com';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not defined');
      return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Contato <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `Contato: ${subject || 'Sem Assunto'} - ${name}`,
        html: `
          <h2>Novo contato via Ivan Artworks</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject || 'Sem Assunto'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, id: data.id });
    } else {
      console.error('Resend API error:', data);
      return NextResponse.json({ error: 'Erro ao enviar e-mail via Resend.' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error sending email:', err);
    return NextResponse.json({ error: 'Erro interno ao processar o contato.' }, { status: 500 });
  }
}
