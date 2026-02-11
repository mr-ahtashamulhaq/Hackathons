import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Transit Accessibility App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
feature/map-page-skeleton
          Frontend is ready
=======
          Helping people with disabilities navigate public transport safely
main
        </p>
        <Link 
          to="/map"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          View Map
        </Link>
      </div>
    </div>
  )
}

export default Home
