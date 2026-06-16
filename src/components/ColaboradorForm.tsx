'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ColaboradorFormData, Lider, Comuna, Barrio } from '@/types';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

registerLocale('es', es);

const schema = z.object({
  cedula:           z.string().min(5, 'Mínimo 5 caracteres').max(20),
  nombre:           z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellidos:        z.string().min(2, 'Mínimo 2 caracteres').max(100),
  sexo:             z.enum(['M', 'F']),
  fecha_nacimiento: z.string().min(1, 'La fecha es requerida'),
  direccion:        z.string().max(255),
  telefono:         z.string().max(20),
  email:            z.string().email('Email inválido').max(255).or(z.literal('')),
  lider_cedula:     z.string().min(1, 'Selecciona un líder'),
  barrio_id:        z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<ColaboradorFormData> & { barrio_id?: number | null; initial_comuna_id?: number | null };
  lideres: Lider[];
  comunas: Comuna[];
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ColaboradorForm({ defaultValues, lideres, comunas, onSubmit, isLoading }: Props) {
  const [selectedComunaId, setSelectedComunaId] = useState<string>(
    defaultValues?.initial_comuna_id?.toString() ?? ''
  );
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [loadingBarrios, setLoadingBarrios] = useState(false);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cedula:           defaultValues?.cedula           ?? '',
      nombre:           defaultValues?.nombre           ?? '',
      apellidos:        defaultValues?.apellidos        ?? '',
      sexo:             defaultValues?.sexo             ?? undefined,
      fecha_nacimiento: defaultValues?.fecha_nacimiento ?? '',
      direccion:        defaultValues?.direccion        ?? '',
      telefono:         defaultValues?.telefono         ?? '',
      email:            defaultValues?.email            ?? '',
      lider_cedula:     defaultValues?.lider_cedula     ?? '',
      barrio_id:        defaultValues?.barrio_id?.toString() ?? '',
    },
  });

  // Cargar barrios cuando cambia la comuna seleccionada
  useEffect(() => {
    if (!selectedComunaId) {
      setBarrios([]);
      setValue('barrio_id', '');
      return;
    }
    setLoadingBarrios(true);
    fetch(`/api/barrios?comuna_id=${selectedComunaId}`)
      .then((r) => r.json())
      .then((data) => { setBarrios(data); setLoadingBarrios(false); })
      .catch(() => setLoadingBarrios(false));
  }, [selectedComunaId, setValue]);

  // Cargar barrios iniciales si ya viene con barrio_id
  useEffect(() => {
    if (defaultValues?.initial_comuna_id) {
      fetch(`/api/barrios?comuna_id=${defaultValues.initial_comuna_id}`)
        .then((r) => r.json())
        .then(setBarrios)
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComunaChange = (val: string) => {
    setSelectedComunaId(val);
    setValue('barrio_id', '');
  };

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

        <Field label="Sexo *" error={errors.sexo?.message}>
          <select {...register('sexo')} className={inputCls(!!errors.sexo)}>
            <option value="">Seleccionar...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </Field>

        <Field label="Fecha de Nacimiento *" error={errors.fecha_nacimiento?.message}>
          <Controller
            name="fecha_nacimiento"
            control={control}
            render={({ field }) => (
              <DatePicker
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={80}
                maxDate={new Date()}
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) =>
                  field.onChange(date ? date.toISOString().split('T')[0] : '')
                }
              />
            )}
          />
        </Field>
      </div>

      <Field label="Dirección" error={errors.direccion?.message}>
        <input {...register('direccion')} placeholder="Dirección completa" className={inputCls(!!errors.direccion)} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <input {...register('email')} type="email" placeholder="correo@ejemplo.com" className={inputCls(!!errors.email)} />
      </Field>

      {/* Cascada Comuna → Barrio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Comuna">
          <select
            value={selectedComunaId}
            onChange={(e) => handleComunaChange(e.target.value)}
            className={inputCls(false)}
          >
            <option value="">Sin comuna</option>
            {comunas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Barrio" error={errors.barrio_id?.message}>
          <select
            {...register('barrio_id')}
            disabled={!selectedComunaId || loadingBarrios}
            className={inputCls(false)}
          >
            <option value="">
              {!selectedComunaId
                ? 'Primero selecciona una comuna'
                : loadingBarrios
                  ? 'Cargando barrios...'
                  : 'Sin barrio'}
            </option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Líder asignado *" error={errors.lider_cedula?.message}>
        <select {...register('lider_cedula')} className={inputCls(!!errors.lider_cedula)}>
          <option value="">Seleccionar líder...</option>
          {lideres.map((l) => (
            <option key={l.cedula} value={l.cedula}>
              {l.apellidos}, {l.nombre} — {l.cedula}
            </option>
          ))}
        </select>
      </Field>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Guardar Colaborador'}
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
