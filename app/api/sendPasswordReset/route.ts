import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_EMAIL = process.env.SMTP_USER

export async function POST(req: Request) {
  const { email, resetLink } = await req.json()

  if (!email || !resetLink) {
    return NextResponse.json({ message: 'Email en reset link zijn verplicht' }, { status: 400 })
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Stel je wachtwoord in',
      html: `<p>Beste gebruiker,</p>
             <p>Je kunt je wachtwoord instellen via deze link: <a href="${resetLink}">${resetLink}</a></p>
             <p>Deze link is slechts eenmalig geldig.</p>`,
    })

    return NextResponse.json({ message: 'E-mail succesvol verzonden' })
  } catch (error: any) {
    console.error('Fout bij verzenden mail:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
