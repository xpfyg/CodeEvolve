import React, { useState, useRef } from 'react';

export interface ProjectData {
  name: string;
  path: string;
  files: FileTreeNode[];
  totalFiles: number;
  supportedLanguages: string[];
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  language?: string;
}

interface ProjectImportFormProps {
  onImport?: (projectData: ProjectData) => void;
  loading?: boolean;
}

const ProjectImportForm: React.FC<ProjectImportFormProps> = ({ onImport, loading = false }) => {
  const [projectPath, setProjectPath] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const supportedExtensions = {
  //   '.js': 'JavaScript',
  //   '.jsx': 'React',
  //   '.ts': 'TypeScript',
  //   '.tsx': 'React TypeScript',
  //   '.py': 'Python',
  //   '.go': 'Go',
  //   '.java': 'Java',
  //   '.cpp': 'C++',
  //   '.c': 'C',
  //   '.rs': 'Rust',
  //   '.php': 'PHP',
  //   '.rb': 'Ruby',
  //   '.swift': 'Swift',
  //   '.kt': 'Kotlin',
  //   '.cs': 'C#',
  //   '.vue': 'Vue',
  //   '.svelte': 'Svelte'
  // } as const;

  // const getLanguageFromExtension = (filename: string): string => {
  //   const ext = '.' + filename.split('.').pop()?.toLowerCase();
  //   return supportedExtensions[ext as keyof typeof supportedExtensions] || 'Unknown';
  // };

  const analyzeDirectory = async (dirPath: string): Promise<ProjectData> => {
    // Mock API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate directory analysis
    const mockFiles: FileTreeNode[] = [
      {
        name: 'src',
        path: `${dirPath}/src`,
        type: 'directory',
        children: [
          { name: 'index.ts', path: `${dirPath}/src/index.ts`, type: 'file', size: 1024, language: 'TypeScript' },
          { name: 'components', path: `${dirPath}/src/components`, type: 'directory', children: [
            { name: 'App.tsx', path: `${dirPath}/src/components/App.tsx`, type: 'file', size: 2048, language: 'React TypeScript' },
            { name: 'Header.tsx', path: `${dirPath}/src/components/Header.tsx`, type: 'file', size: 512, language: 'React TypeScript' }
          ]},
          { name: 'utils', path: `${dirPath}/src/utils`, type: 'directory', children: [
            { name: 'helpers.ts', path: `${dirPath}/src/utils/helpers.ts`, type: 'file', size: 256, language: 'TypeScript' }
          ]}
        ]
      },
      {
        name: 'package.json',
        path: `${dirPath}/package.json`,
        type: 'file',
        size: 1536,
        language: 'JSON'
      },
      {
        name: 'README.md',
        path: `${dirPath}/README.md`,
        type: 'file',
        size: 2048,
        language: 'Markdown'
      }
    ];

    const languages = Array.from(new Set(
      mockFiles.flatMap(file => getAllFiles(file))
        .filter(f => f.language)
        .map(f => f.language!)
    ));

    return {
      name: dirPath.split('/').pop() || 'project',
      path: dirPath,
      files: mockFiles,
      totalFiles: getAllFiles({ name: 'root', path: dirPath, type: 'directory', children: mockFiles }).length,
      supportedLanguages: languages
    };
  };

  const getAllFiles = (node: FileTreeNode): FileTreeNode[] => {
    if (node.type === 'file') return [node];
    return node.children?.flatMap(getAllFiles) || [];
  };

  const handleDirectorySelect = async () => {
    if (!projectPath.trim()) {
      setError('请输入项目路径');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeDirectory(projectPath.trim());
      setProjectData(data);
      setError(null);
    } catch (error) {
      console.error('Failed to analyze project:', error);
      setError('分析项目失败，请检查路径是否正确');
      setProjectData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = () => {
    if (projectData && onImport) {
      onImport(projectData);
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], level = 0) => {
    return nodes.map((node, index) => (
      <div key={index} className={`ml-${level * 4}`}>
        <div className="flex items-center py-1 text-sm">
          <span className="mr-2">
            {node.type === 'directory' ? '📁' : getFileIcon(node.name)}
          </span>
          <span className={node.type === 'directory' ? 'font-medium text-blue-600' : 'text-gray-700'}>
            {node.name}
          </span>
          {node.size && (
            <span className="ml-auto text-xs text-gray-500">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'js': '📄', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️',
      'py': '🐍', 'go': '🐹', 'java': '☕', 'cpp': '⚙️',
      'c': '⚙️', 'rs': '🦀', 'php': '🐘', 'rb': '💎',
      'vue': '💚', 'md': '📝', 'json': '📋', 'yml': '📋', 'yaml': '📋'
    };
    return iconMap[ext || ''] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Import Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">📁</span>
          项目导入
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="projectPath" className="block text-sm font-medium text-gray-700 mb-2">
              项目路径 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="projectPath"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/path/to/your/project"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isAnalyzing || loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                disabled={isAnalyzing || loading}
              >
                浏览
              </button>
              <input
                ref={fileInputRef}
                type="file"
                {...({ webkitdirectory: "" } as any)}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const path = files[0].webkitRelativePath.split('/')[0];
                    setProjectPath(path);
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              输入本地项目的绝对路径，或点击浏览选择文件夹
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-2">⚠️</span>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleDirectorySelect}
            disabled={isAnalyzing || loading || !projectPath.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                正在分析项目...
              </div>
            ) : (
              '分析项目结构'
            )}
          </button>
        </div>
      </div>

      {/* Project Analysis Results */}
      {projectData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <h3 className="text-xl font-bold flex items-center mb-2">
              <span className="text-2xl mr-3">✅</span>
              项目分析完成
            </h3>
            <p className="text-green-100">
              已成功解析项目结构和文件信息
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{projectData.totalFiles}</div>
                <div className="text-blue-800 font-medium">文件总数</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{projectData.supportedLanguages.length}</div>
                <div className="text-green-800 font-medium">编程语言</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{projectData.name}</div>
                <div className="text-purple-800 font-medium">项目名称</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">支持的编程语言</h4>
              <div className="flex flex-wrap gap-2">
                {projectData.supportedLanguages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">项目结构</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {renderFileTree(projectData.files)}
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading ? '导入中...' : '确认导入项目'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectImportForm;