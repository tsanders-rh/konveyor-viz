import { useState, useEffect } from 'react';
import IssueList from './IssueList';
import { getTechnologyStatusColor } from '../../utils/colorUtils';

const ComponentDetail = ({ component, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (component) {
      // Trigger animation after mount
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [component]);

  if (!component) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const issuesBySeverity = {
    critical: component.issues.filter((i) => i.severity === 'critical').length,
    warning: component.issues.filter((i) => i.severity === 'warning').length,
    info: component.issues.filter((i) => i.severity === 'info').length,
  };

  const statusEmoji = {
    eol: '🔴',
    outdated: '🟡',
    current: '🟢',
  };

  return (
    <>
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 border-b pb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {component.name}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {component.type}
                </span>
                <span className="text-sm text-gray-500">
                  {component.linesOfCode.toLocaleString()} lines of code
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Issue Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Issue Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-900">
                  {issuesBySeverity.critical}
                </div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {issuesBySeverity.warning}
                </div>
                <div className="text-sm text-yellow-600">Warning</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {issuesBySeverity.info}
                </div>
                <div className="text-sm text-gray-600">Info</div>
              </div>
            </div>
          </div>

          {/* Technology Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Technology Stack
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              {component.technology.language && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">
                    {component.technology.language}
                    {component.technology.version &&
                      ` ${component.technology.version}`}
                  </span>
                </div>
              )}
              {component.technology.framework && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Framework:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {component.technology.framework}
                    </span>
                    {component.technology.frameworkStatus && (
                      <span
                        style={{
                          color: getTechnologyStatusColor(
                            component.technology.frameworkStatus
                          ),
                        }}
                      >
                        {statusEmoji[component.technology.frameworkStatus]}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {component.technology.type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {component.technology.type}
                      {component.technology.version &&
                        ` ${component.technology.version}`}
                    </span>
                    {component.technology.status && (
                      <span
                        style={{
                          color: getTechnologyStatusColor(
                            component.technology.status
                          ),
                        }}
                      >
                        {statusEmoji[component.technology.status]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issues List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Issues ({component.issues.length})
            </h3>
            <IssueList issues={component.issues} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentDetail;
