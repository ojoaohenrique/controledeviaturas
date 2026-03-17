import { createClient } from './server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: viaturas, error } = await supabase.from('viaturas').select('*')

    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold mb-4">Controle de Viaturas</h1>
            {error && <p className="text-red-500">Erro ao carregar dados.</p>}
            <ul className="space-y-2">
                {viaturas?.map((viatura) => (
                    <li key={viatura.id} className="p-2 border rounded">
                        {viatura.placa} - {viatura.modelo}
                    </li>
                ))}
            </ul>
            {viaturas?.length === 0 && <p>Nenhuma viatura encontrada.</p>}
        </main>
    )
}