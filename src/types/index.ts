export interface Lider {
  id: number;
  cedula: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  creado_en?: string;
  total_colaboradores?: number;
}

export interface Habilidades {
  vehiculo: boolean;
  perifoneo: boolean;
  orador_publico: boolean;
  redes_sociales: boolean;
}

export interface Colaborador {
  id: number;
  cedula: string;
  nombre: string;
  apellidos: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  lider_cedula: string;
  creado_en?: string;
  lider_nombre?: string;
  lider_apellidos?: string;
  habilidades?: Habilidades;
}

export interface LiderFormData {
  cedula: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  telefono: string;
}

export interface ColaboradorFormData {
  cedula: string;
  nombre: string;
  apellidos: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  lider_cedula: string;
}
