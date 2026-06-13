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
