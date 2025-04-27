import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sistema de Gestión de Farmacia
          </h1>
          <p className="text-xl text-gray-600">
            Gestión eficiente de inventario y ventas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tarjeta de Productos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Productos</h2>
            <p className="text-gray-600 mb-4">
              Gestiona tu inventario de medicamentos y productos farmacéuticos.
            </p>
            <a
              href="/productos"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Ver Productos
            </a>
          </div>

          {/* Tarjeta de Ventas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ventas</h2>
            <p className="text-gray-600 mb-4">
              Registra y consulta las ventas realizadas.
            </p>
            <a
              href="/ventas"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Gestionar Ventas
            </a>
          </div>

          {/* Tarjeta de Reportes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reportes</h2>
            <p className="text-gray-600 mb-4">
              Visualiza estadísticas y genera reportes de ventas.
            </p>
            <a
              href="/reportes"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Ver Reportes
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Sistema de Gestión de Farmacia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
