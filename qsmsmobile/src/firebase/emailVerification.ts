import { sendEmailVerification, User } from "firebase/auth";

export async function sendEmailVerificationLink(user: User) {
  if (user.emailVerified) return true;

  await sendEmailVerification(user);
  return true;
}

export async function checkEmailVerified(user: User): Promise<boolean> {
  await user.reload();
  return user.emailVerified;
}
