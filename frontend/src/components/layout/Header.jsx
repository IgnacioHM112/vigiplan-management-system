export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-600 hover:text-gray-900 text-xl cursor-pointer"
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
          J
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Jefe</span>
      </div>
    </header>
  );
}
