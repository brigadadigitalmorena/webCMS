export default function SystemHealthPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Estado del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Monitoreo del estado y rendimiento del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">API Status</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Operativo</p>
          <p className="text-sm text-gray-500 mt-1">Uptime: 99.9%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Base de datos</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Normal</p>
          <p className="text-sm text-gray-500 mt-1">Latencia: 12ms</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Almacenamiento</h3>
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          </div>
          <p className="text-2xl font-bold text-gray-900">85%</p>
          <p className="text-sm text-gray-500 mt-1">340 GB / 400 GB</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Alertas recientes
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">No hay alertas críticas</p>
        </div>
      </div>
    </div>
  );
}
