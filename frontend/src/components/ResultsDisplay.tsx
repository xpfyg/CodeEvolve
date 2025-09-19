import React from 'react';
import { CodeModificationResponse, CodeAnalysisResponse, TestGenerationResponse } from '../types/index';

interface ResultsDisplayProps {
  codeGeneration?: CodeModificationResponse | null;
  codeAnalysis?: CodeAnalysisResponse | null;
  testGeneration?: TestGenerationResponse | null;
  onClear?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  codeGeneration,
  codeAnalysis,
  testGeneration,
  onClear
}) => {
  if (!codeGeneration && !codeAnalysis && !testGeneration) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">操作结果</h2>
        {onClear && (
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            清除结果
          </button>
        )}
      </div>

      {/* Code Generation Results */}
      {codeGeneration && (
        <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
          <h3 className="text-lg font-medium text-green-800 mb-2">代码生成结果</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">状态:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                codeGeneration.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {codeGeneration.success ? '成功' : '失败'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">分支名称:</span>
              <span className="ml-2 text-blue-600">{codeGeneration.branch_name}</span>
            </div>
            {codeGeneration.commit_hash && (
              <div>
                <span className="font-medium text-gray-700">提交哈希:</span>
                <span className="ml-2 font-mono text-sm text-gray-600">{codeGeneration.commit_hash}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">消息:</span>
              <span className="ml-2 text-gray-800">{codeGeneration.message}</span>
            </div>
            {codeGeneration.modified_files && codeGeneration.modified_files.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">修改的文件:</span>
                <ul className="ml-2 mt-1 space-y-1">
                  {codeGeneration.modified_files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 font-mono">{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Analysis Results */}
      {codeAnalysis && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-lg font-medium text-blue-800 mb-2">代码分析结果</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">状态:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                codeAnalysis.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {codeAnalysis.success ? '成功' : '失败'}
              </span>
            </div>
            {codeAnalysis.success && codeAnalysis.analysis && (
              <div className="space-y-2">
                {codeAnalysis.analysis.complexity && (
                  <div>
                    <span className="font-medium text-gray-700">复杂度:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      codeAnalysis.analysis.complexity === 'low' ? 'bg-green-100 text-green-800' :
                      codeAnalysis.analysis.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {codeAnalysis.analysis.complexity}
                    </span>
                  </div>
                )}
                {codeAnalysis.analysis.maintainability && (
                  <div>
                    <span className="font-medium text-gray-700">可维护性:</span>
                    <span className="ml-2 text-gray-800">{codeAnalysis.analysis.maintainability}</span>
                  </div>
                )}
                {codeAnalysis.analysis.test_coverage && (
                  <div>
                    <span className="font-medium text-gray-700">测试覆盖率:</span>
                    <span className="ml-2 text-gray-800">{codeAnalysis.analysis.test_coverage}</span>
                  </div>
                )}
                {codeAnalysis.analysis.code_smells && codeAnalysis.analysis.code_smells.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">代码异味:</span>
                    <ul className="ml-2 mt-1 space-y-1">
                      {codeAnalysis.analysis.code_smells.map((smell, index) => (
                        <li key={index} className="text-sm text-red-600">{smell}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {codeAnalysis.suggestions && codeAnalysis.suggestions.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">改进建议:</span>
                <ul className="ml-2 mt-1 space-y-1">
                  {codeAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-600">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Generation Results */}
      {testGeneration && (
        <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <h3 className="text-lg font-medium text-purple-800 mb-2">测试生成结果</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">状态:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                testGeneration.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testGeneration.success ? '成功' : '失败'}
              </span>
            </div>
            {testGeneration.success && (
              <>
                <div>
                  <span className="font-medium text-gray-700">测试文件:</span>
                  <span className="ml-2 font-mono text-sm text-gray-600">{testGeneration.test_file_path}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">生成的测试代码:</span>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono text-gray-800 overflow-x-auto max-h-60">
                    {testGeneration.test_content}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;