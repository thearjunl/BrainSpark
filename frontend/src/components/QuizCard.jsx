import React from 'react';

const QuizCard = ({ quiz }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h3 className="text-lg font-bold mb-1">{quiz.name}</h3>
      <div className="text-sm text-gray-600 mb-2">Status: {quiz.status}</div>
      <div className="text-sm">Questions: {quiz.questions?.length || 0}</div>
      <div className="text-sm">Group: {quiz.groupName || '-'}</div>
    </div>
  );
};

export default QuizCard; 