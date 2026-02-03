import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-netflix-black text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-netflix-red">StreamFlow</h1>
          <p className="mt-4 text-gray-300">Welcome to StreamFlow - Your streaming platform</p>
        </div>
      </div>
    </Router>
  )
}

export default App
