"use client";

import React from 'react';

interface ResetButtonProps {
  onReset: () => void;
  isLoading: boolean;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onReset, isLoading }) => {
  return (
    <button
      onClick={onReset}
      className="reset-button"
      disabled={isLoading}
    >
      {isLoading ? 'Resetting...' : 'Reset Conversation'}
    </button>
  );
};

export default ResetButton;
