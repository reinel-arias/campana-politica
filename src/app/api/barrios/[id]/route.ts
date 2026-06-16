import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT b.*, c.nombre AS comuna_nombre FROM barrios b JOIN comunas c ON b.comuna_id = c.id WHERE b.id = ?',
      [params.id]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Barrio no encontrado' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener barrio' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, comuna_id } = await req.json();
    if (!nombre?.trim() || !comuna_id) {
      return NextResponse.json({ error: 'Nombre y comuna son requeridos' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE barrios SET nombre = ?, comuna_id = ? WHERE id = ?',
      [nombre.trim(), comuna_id, params.id]
    );
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Barrio no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe ese barrio en esta comuna' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar barrio' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM barrios WHERE id = ?', [params.id]);
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Barrio no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar barrio' }, { status: 500 });
  }
}
