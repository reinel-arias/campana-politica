export const dynamic = 'force-dynamic';

import { getLiderDeSesion, getComunas, getZonas } from '../lider';
import CapturaClient from '../CapturaClient';

export default async function CapturaNuevoPage() {
  const lider = await getLiderDeSesion();
  const nombreLider = lider ? `${lider.nombre} ${lider.apellidos}` : '';
  const liderCedula = lider?.cedula ?? '';

  const [comunas, zonas] = await Promise.all([getComunas(), getZonas()]);
  return <CapturaClient comunas={comunas} zonas={zonas} nombreLider={nombreLider} liderCedula={liderCedula} />;
}
