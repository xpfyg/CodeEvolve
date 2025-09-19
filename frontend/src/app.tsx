import { useAppStore } from './store';
import RepoLoader from './components/RepoLoader';
import IssueList from './components/IssueList';

function App() {
  const { repoPath, isRepoValid, clearRepo } = useAppStore();

  // Show repository loader if no valid repo is selected
  if (!repoPath || !isRepoValid) {
    return <RepoLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                <h1 className="text-3xl font-bold mb-2">
                  CodeEvolve AI
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📁</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {repoPath}
                  </span>
                </div>
                <button
                  onClick={clearRepo}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  切换项目
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">项目已连接</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <IssueList />
        </main>
      </div>
    </div>
  );
}

export default App;