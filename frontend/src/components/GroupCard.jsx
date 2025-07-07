import React from 'react';

const GroupCard = ({ group }) => {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h3 className="text-lg font-bold mb-1">{group.name}</h3>
      <div className="text-sm text-gray-600 mb-2">Code: {group.code}</div>
      <div className="text-sm">Subject: {group.subject}</div>
      <div className="text-sm">Members: {group.members?.length || 0}</div>
    </div>
  );
};

export default GroupCard; 