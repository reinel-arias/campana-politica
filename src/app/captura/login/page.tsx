import { redirect } from 'next/navigation';

// El login es único: /login decide si el usuario va a la app principal o a /captura
export default function CapturaLoginPage() {
  redirect('/login');
}
