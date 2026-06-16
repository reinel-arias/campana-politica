import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.*, COUNT(b.id) AS total_barrios
      FROM comunas c
      LEFT JOIN barrios b ON b.comuna_id = c.id
      GROUP BY c.id
      ORDER BY c.nombre
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener comunas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comunas (nombre) VALUES (?)',
      [nombre.trim()]
    );
    return NextResponse.json({ id: result.insertId, nombre: nombre.trim() }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una comuna con ese nombre' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear comuna' }, { status: 500 });
  }
}
