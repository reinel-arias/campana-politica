export interface Comuna {
  id: number;
  nombre: string;
  total_barrios?: number;
}

export interface Barrio {
  id: number;
  nombre: string;
  comuna_id: number;
  comuna_nombre?: string;
}

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
  barrio_id?: number | null;
  barrio_nombre?: string;
  comuna_nombre?: string;
  puesto_votacion_id?: number | null;
  puesto_nombre?: string;
  puesto_codigo?: string;
  zona_codigo?: string;
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

export interface Gestion {
  id: number;
  colaborador_id: number;
  descripcion: string;
  fecha_limite: string;       // YYYY-MM-DD
  gestionado: boolean;
  fecha_ejecucion: string | null;
  creado_en?: string;
}

export interface GestionResumen {
  colaborador_id: number;
  colaborador_nombre: string;
  colaborador_apellidos: string;
  colaborador_cedula: string;
  barrio_nombre: string | null;
  total: number;
  pendientes: number;
  vencidas: number;
  proxima_fecha: string | null;
}

export interface Zona {
  id: number;
  codigo: string;
  total_puestos?: number;
}

export interface PuestoVotacion {
  id: number;
  zona_id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  num_mesas: number;
  zona_codigo?: string;
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
  barrio_id?: number | null;
  puesto_votacion_id?: number | null;
}
