import nodemailer from 'nodemailer'

export async function sendPasswordResetMail(to: string, resetLink: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: '"SkyTeck Liga" <no-reply@skyteck.be>',
    to,
    subject: 'Stel je wachtwoord in voor SkyTeck Liga',
    text: `Je bent toegevoegd aan SkyTeck Liga. Klik op deze link om een wachtwoord aan te maken: ${resetLink}`,
    html: `<p>Je bent toegevoegd aan SkyTeck Liga. Klik op deze link om een wachtwoord aan te maken:</p><a href="${resetLink}">${resetLink}</a>`,
  }

  await transporter.sendMail(mailOptions)
}
