import React, { useState, useEffect } from 'react';

/**
 * Formats seconds into M:SS or EXPIRED
 */
const formatAdminTime = (seconds) => {
  if (seconds <= 0) return 'EXPIRED';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/**
 * Live countdown timer for the admin dashboard.
 * Dynamically changes color based on time remaining to alert the admin.
 */
const AdminTimer = ({ startedAt, duration }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const total = duration * 60;
      setTimeLeft(Math.max(0, total - elapsed));
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration]);

  const color = timeLeft > 300 
    ? 'text-emerald-400' 
    : timeLeft > 60 
      ? 'text-amber-400' 
      : 'text-red-400';

  return (
    <span className={`font-mono font-montserrat text-xl tabular-nums ${color}`}>
      {formatAdminTime(timeLeft)}
    </span>
  );
};

export default AdminTimer;
