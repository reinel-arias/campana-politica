import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { codigo } = await req.json();
    if (!codigo?.trim()) {
      return NextResponse.json({ error: 'El código es requerido' }, { status: 400 });
    }
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE zonas SET codigo = ? WHERE id = ?',
      [codigo.trim().padStart(2, '0'), params.id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Ya existe una zona con ese código' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar zona' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM zonas WHERE id = ?', [params.id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar zona' }, { status: 500 });
  }
}
