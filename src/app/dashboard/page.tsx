export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Usuarios</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Encuestas</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Asignaciones</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Respuestas</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
