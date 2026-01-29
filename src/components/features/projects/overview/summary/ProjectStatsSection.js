import React, { useEffect, useState, useCallback } from 'react';
import Dropdown from '@/utils/Dropdown';
import { useSelector } from 'react-redux';

const PERIOD_OPTIONS = [
  { label: 'Last 1 day', value: '1d' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
];

const ProjectStatsSection = ({ projectId }) => {
  const { token } = useSelector((state) => state.auth);
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState({ created: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchTimeout, setFetchTimeout] = useState(null);

  const fetchStats = useCallback((selectedPeriod) => {
    if (!projectId || !token) return;
    setLoading(true);
    setError(null);
    fetch(`/api/projects/${projectId}/stats?period=${selectedPeriod}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats({ created: data.created, completed: data.completed });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    if (fetchTimeout) clearTimeout(fetchTimeout);
    const timeout = setTimeout(() => fetchStats(period), 300);
    setFetchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [period, fetchStats]);

  return (
    <section className="flex overflow-hidden flex-col items-start px-5 pt-5 mt-2 w-full bg-white rounded shadow-[0px_3px_7px_rgba(0,0,0,0.133)] max-md:max-w-full">
      <div className="flex flex-wrap gap-5 justify-between self-stretch w-full max-md:max-w-full items-center">
        <h2 className="self-start text-xl tracking-tight text-black">Project stats</h2>
        <div className="min-w-[180px]">
          <Dropdown
            options={PERIOD_OPTIONS.map(opt => ({ label: opt.label }))}
            initialValue={PERIOD_OPTIONS.find(opt => opt.value === period)?.label}
            defaultSelected={[]}
            onSelect={(label) => {
              const found = PERIOD_OPTIONS.find(opt => opt.label === label);
              setPeriod(found ? found.value : '7d');
            }}
            className="bg-gray-100"
          />
        </div>
      </div>
      <h3 className="mt-7 text-base text-black">Boards</h3>
      <div className="pb-5 flex flex-wrap gap-10 mt-7 max-w-full text-base text-black w-[648px]">
        <StatCard
          icon="📊"
          value={loading ? '...' : stats.created}
          label="Work items created"
        />
        <StatCard
          icon="✅"
          value={loading ? '...' : stats.completed}
          label="Work items completed"
        />
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </section>
  );
};

const StatCard = ({ icon, value, label }) => (
  <article className="flex flex-1 gap-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </article>
);

export default ProjectStatsSection; 