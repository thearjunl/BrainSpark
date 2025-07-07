import React from 'react';

const Leaderboard = ({ leaderboard }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h4 className="text-lg font-semibold mb-2">Leaderboard</h4>
      <ol className="list-decimal pl-6">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry, idx) => (
            <li key={entry.userId} className="mb-1">
              <span className="font-bold">{entry.userName}</span> - {entry.score} pts
            </li>
          ))
        ) : (
          <li>No data yet.</li>
        )}
      </ol>
    </div>
  );
};

export default Leaderboard; 