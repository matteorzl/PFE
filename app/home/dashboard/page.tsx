export default function DashboardPage() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cartes statistiques */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Total Utilisateurs</h3>
                <p className="text-3xl font-bold">1,234</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Séries Actives</h3>
                <p className="text-3xl font-bold">56</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Exercices Complétés</h3>
                <p className="text-3xl font-bold">8,769</p>
            </div>
        </div>
      </div>
    );
  }