/**
 * 🔐 ESQUEMAS DE VALIDACIÓN CON ZOD
 * ===================================
 * 
 * Validación estricta de formularios de autenticación
 * - Email con formato válido
 * - Contraseña con requisitos de seguridad
 * - Confirmación de contraseña
 */

import { z } from 'zod';

// Esquema de validación para Login
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Esquema de validación para Registro
export const RegistroSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingrese un correo electrónico válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    confirmPassword: z
      .string()
      .min(1, 'Debe confirmar la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Tipos TypeScript derivados de los esquemas
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegistroFormData = z.infer<typeof RegistroSchema>;