import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM comunas WHERE id = ?', [params.id]);
    if (rows.length === 0) return NextResponse.json({ error: 'Comuna no encontrada' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener comuna' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre } = await req.json();
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE comunas SET nombre = ? WHERE id = ?',
      [nombre.trim(), params.id]
    );
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Comuna no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una comuna con ese nombre' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar comuna' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [barrios] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM barrios WHERE comuna_id = ?', [params.id]
    );
    if ((barrios[0] as { total: number }).total > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: la comuna tiene barrios asociados' },
        { status: 409 }
      );
    }
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM comunas WHERE id = ?', [params.id]);
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Comuna no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar comuna' }, { status: 500 });
  }
}
