import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { hashedString } from './auth.js';
import { validateEmailVerification } from '../schema/emailVerification.js';
import { verifyEmailQuery } from '../models/auth.js';
import { validatePasswordReset } from '../schema/passwordReset.js';
import { createNewPasswordQuery } from '../models/user.js';

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

export const sendVerificationEmail = async (user, res) => {
  const { id, email, lastname } = user[0];

  const token = id + uuidv4();
  const link = APP_URL + 'users/verify/' + id + '/' + token;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: 'Verification email',
    html: `<div
        style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
        <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
        <hr>
        <h4>Hi ${lastname},</h4>
        <p>
            Please verify your email address so we can know that it's really you.
            <br>
        <p>This link <b>expires in 1 hour</b></p>
        <br>
        <a href=${link}
            style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px;">Verify
            Email Address</a>
        </p>
        <div style="margin-top: 20px;">
            <h5>Best Regards</h5>
            <h5>ShareFun Team</h5>
        </div>
    </div>`,
  };

  try {
    const hashedToken = await hashedString(token);
    const createdAtDate = new Date();
    const expiresAtDate = new Date(createdAtDate.getTime() + 3600000);

    const newVerifiedEmail = validateEmailVerification({
      userId: id,
      token: hashedToken,
      createdAt: createdAtDate,
      expiresAt: expiresAtDate,
    });

    if (newVerifiedEmail.success) {
      await verifyEmailQuery(newVerifiedEmail);
      transporter.sendMail(mailOptions);
      /* .then(() => {
          res.status(201).send({
            success: 'PENDING',
            message:
              'Verification email has been sent to your account. Check your email for further instructions.',
          });
          console.log(
            'Verification email has been sent to your account. Check your email for further instructions.'
          );
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: 'Something went wrong' });
        }); */
    } else {
      console.error(newVerifiedEmail.error);
    }
    console.log('New verified email', newVerifiedEmail);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Something went wrong' });
  }
};

export const resetPasswordLink = async (user, res) => {
  const { id, email } = user;
  const token = id + uuidv4();
  const link = APP_URL + 'users/reset-password/' + id + '/' + token;
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: 'Password Reset',
    html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
         Password reset link. Please click the link below to reset password.
        <br>
        <p style="font-size: 18px;"><b>This link expires in 10 minutes</b></p>
         <br>
        <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
    </p>`,
  };

  try {
    const hashedToken = await hashedString(token);

    const createdAtDate = new Date();
    const expiresAtDate = new Date(createdAtDate.getTime() + 600000);
    const validatedPassword = validatePasswordReset({
      userId: id,
      email: email,
      token: hashedToken,
      createdAt: createdAtDate,
      expiresAt: expiresAtDate,
    });

    if (validatedPassword.success) {
      await createNewPasswordQuery(validatedPassword.data);
      transporter.sendMail(mailOptions);
      /* .then(() => {
          res.status(201).send({
            success: 'PENDING',
            message: 'Reset Password Link has been sent to your account.',
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: 'Something went wrong' });
        }); */
    }
    console.log(validatedPassword.error);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Something went wrong' });
  }
};
