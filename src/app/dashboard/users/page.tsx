export default function UsersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Crear Usuario
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <p className="p-6 text-gray-600">Lista de usuarios...</p>
      </div>
    </div>
  );
}
