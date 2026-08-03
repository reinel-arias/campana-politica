'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LiderFormData } from '@/types';

const schema = z.object({
  cedula:    z.string().min(5, 'Mínimo 5 caracteres').max(20),
  nombre:    z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  direccion: z.string().max(255),
  telefono:  z.string().max(20),
  email:     z.union([z.string().email('Email inválido'), z.literal('')]),
  usuario:   z.string().max(100),
  clave:     z.string().max(255),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<LiderFormData>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function LiderForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cedula:    defaultValues?.cedula    ?? '',
      nombre:    defaultValues?.nombre    ?? '',
      apellidos: defaultValues?.apellidos ?? '',
      direccion: defaultValues?.direccion ?? '',
      telefono:  defaultValues?.telefono  ?? '',
      email:     defaultValues?.email     ?? '',
      usuario:   defaultValues?.usuario   ?? '',
      clave:     '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Cédula *" error={errors.cedula?.message}>
          <input {...register('cedula')} placeholder="Ej: 1234567890" className={inputCls(!!errors.cedula)} />
        </Field>
        <Field label="Teléfono" error={errors.telefono?.message}>
          <input {...register('telefono')} placeholder="Ej: 3001234567" className={inputCls(!!errors.telefono)} />
        </Field>
        <Field label="Nombre *" error={errors.nombre?.message}>
          <input {...register('nombre')} placeholder="Nombre" className={inputCls(!!errors.nombre)} />
        </Field>
        <Field label="Apellidos *" error={errors.apellidos?.message}>
          <input {...register('apellidos')} placeholder="Apellidos" className={inputCls(!!errors.apellidos)} />
        </Field>
      </div>
      <Field label="Dirección" error={errors.direccion?.message}>
        <input {...register('direccion')} placeholder="Dirección completa" className={inputCls(!!errors.direccion)} />
      </Field>
      <Field label="Correo electrónico" error={errors.email?.message}>
        <input {...register('email')} type="email" placeholder="correo@ejemplo.com" className={inputCls(!!errors.email)} />
      </Field>

      <div className="border-t border-slate-100 pt-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Acceso al portal de captura</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Usuario" error={errors.usuario?.message}>
            <input {...register('usuario')} placeholder="usuario_captura" autoComplete="off" className={inputCls(!!errors.usuario)} />
          </Field>
          <Field label="Clave" error={errors.clave?.message}>
            <input {...register('clave')} type="password" placeholder={defaultValues?.usuario ? 'Dejar en blanco para no cambiar' : 'Clave de acceso'} autoComplete="new-password" className={inputCls(!!errors.clave)} />
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Guardar Líder'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
    hasError ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
  }`;
}
