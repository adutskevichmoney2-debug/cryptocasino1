import { z } from "zod";

/**
 * Schemas emit i18n keys rather than English text; forms render them through
 * t(`validation.${key}`). Keeps every message translatable.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "required").email("email"),
  password: z.string().min(1, "required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().min(1, "required").email("email"),
    nickname: z
      .string()
      .min(3, "nicknameShort")
      .max(16, "nicknameLong")
      .regex(/^[a-zA-Z0-9_]+$/, "nicknameChars"),
    password: z
      .string()
      .min(8, "passwordShort")
      .regex(/[a-zA-Z]/, "passwordLetter")
      .regex(/[0-9]/, "passwordDigit"),
    confirmPassword: z.string().min(1, "required"),
    refCode: z.string().optional(),
    terms: z.literal(true, { message: "termsRequired" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "required"),
    next: z
      .string()
      .min(8, "passwordShort")
      .regex(/[a-zA-Z]/, "passwordLetter")
      .regex(/[0-9]/, "passwordDigit"),
    confirm: z.string().min(1, "required"),
  })
  .refine((data) => data.next === data.confirm, {
    message: "passwordMismatch",
    path: ["confirm"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const contactSchema = z.object({
  email: z.string().min(1, "required").email("email"),
  topic: z.string().min(1, "required"),
  message: z.string().min(20, "messageShort").max(1000, "messageLong"),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const profileSchema = z.object({
  nickname: z
    .string()
    .min(3, "nicknameShort")
    .max(16, "nicknameLong")
    .regex(/^[a-zA-Z0-9_]+$/, "nicknameChars"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
