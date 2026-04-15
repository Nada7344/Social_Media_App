import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";
import { APPLICATION_NAME, EMAIL, EMAIL_APP_PASSWORD } from "../../../config/config.js";

export const sendEmail =async({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments=[]
}:Mail.Options) :Promise<void>=>{

const transporter = nodemailer.createTransport({
  service :"gmail",
  auth: {
    user:EMAIL,
    pass: EMAIL_APP_PASSWORD,
  },
});


try {
  const info = await transporter.sendMail({
    from: `${APPLICATION_NAME} <${EMAIL}>`, // sender address
    to,
    cc,
    bcc,
    html,
    subject,
    attachments
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}

}