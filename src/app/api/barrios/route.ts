import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const comunaId = searchParams.get('comuna_id');

    let query = `
      SELECT b.*, c.nombre AS comuna_nombre
      FROM barrios b
      JOIN comunas c ON b.comuna_id = c.id
    `;
    const params: unknown[] = [];

    if (comunaId) {
      query += ' WHERE b.comuna_id = ?';
      params.push(comunaId);
    }
    query += ' ORDER BY c.nombre, b.nombre';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener barrios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, comuna_id } = await req.json();
    if (!nombre?.trim() || !comuna_id) {
      return NextResponse.json({ error: 'Nombre y comuna son requeridos' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO barrios (nombre, comuna_id) VALUES (?, ?)',
      [nombre.trim(), comuna_id]
    );
    return NextResponse.json({ id: result.insertId, nombre: nombre.trim(), comuna_id }, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe ese barrio en esta comuna' }, { status: 409 });
    }
    if (e.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ error: 'La comuna seleccionada no existe' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear barrio' }, { status: 500 });
  }
}
