import React from 'react';

const QuizQuestion = ({ question, onAnswer }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h4 className="text-lg font-semibold mb-2">{question.questionText}</h4>
      {question.type === 'mcq' && (
        <div className="space-y-2">
          {Object.entries(question.options || {}).map(([key, value]) => (
            <button
              key={key}
              className="block w-full text-left px-4 py-2 border rounded hover:bg-blue-50"
              onClick={() => onAnswer(key)}
            >
              <span className="font-bold mr-2">{key}.</span> {value}
            </button>
          ))}
        </div>
      )}
      {question.type === 'short_answer' && (
        <form onSubmit={e => { e.preventDefault(); onAnswer(e.target.answer.value); }}>
          <input name="answer" className="w-full px-3 py-2 border rounded mb-2" placeholder="Type your answer..." />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
        </form>
      )}
    </div>
  );
};

export default QuizQuestion; 