import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Consultar la BD en cada petición (no generar una respuesta fija al compilar)
export const dynamic = 'force-dynamic';

// Solo lectura: la tabla ciudades se llena por SQL
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nombre FROM ciudades ORDER BY nombre');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener ciudades' }, { status: 500 });
  }
}
