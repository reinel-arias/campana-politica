import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT z.id, z.codigo, COUNT(p.id) AS total_puestos
      FROM zonas z
      LEFT JOIN puestos_votacion p ON p.zona_id = z.id
      GROUP BY z.id, z.codigo
      ORDER BY z.codigo
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener zonas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { codigo } = await req.json();
    if (!codigo?.trim()) {
      return NextResponse.json({ error: 'El código es requerido' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO zonas (codigo) VALUES (?)',
      [codigo.trim().padStart(2, '0')]
    );
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una zona con ese código' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear zona' }, { status: 500 });
  }
}
