import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const zonaId = new URL(req.url).searchParams.get('zona_id');
    const where = zonaId ? 'WHERE p.zona_id = ?' : '';
    const params = zonaId ? [zonaId] : [];
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, z.codigo AS zona_codigo
       FROM puestos_votacion p
       JOIN zonas z ON p.zona_id = z.id
       ${where}
       ORDER BY p.codigo`,
      params
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener puestos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { zona_id, codigo, nombre, direccion, num_mesas } = await req.json();
    if (!zona_id || !codigo?.trim() || !nombre?.trim()) {
      return NextResponse.json({ error: 'zona_id, código y nombre son requeridos' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO puestos_votacion (zona_id, codigo, nombre, direccion, num_mesas)
       VALUES (?, ?, ?, ?, ?)`,
      [zona_id, codigo.trim().padStart(2, '0'), nombre.trim(),
       (direccion || '').trim(), Number(num_mesas) || 0]
    );
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe un puesto con ese código en la zona' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear puesto' }, { status: 500 });
  }
}
