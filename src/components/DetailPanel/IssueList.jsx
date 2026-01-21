import { getSeverityBadgeClass } from '../../utils/colorUtils';

const IssueList = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No issues found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 flex-1">{issue.title}</h4>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadgeClass(
                issue.severity
              )}`}
            >
              {issue.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
          <div className="flex items-center text-xs text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <code className="text-xs">{issue.location}</code>
          </div>
          {issue.type && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                {issue.type}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IssueList;
