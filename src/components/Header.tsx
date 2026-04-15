export default function Header({ titulo = 'Minha Loja' }) {
  return (
    <header className="w-full border-b border-slate-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <a href="#" className="hover:text-slate-900">Inicio</a>
          <a href="#" className="hover:text-slate-900">Produtos</a>
          <a href="#" className="hover:text-slate-900">Contato</a>
        </nav>
      </div>
    </header>
  )
}
