import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ProjectMembersSection = ({ projectId }) => {
  const { token } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId || !token) return;
    setLoading(true);
    setError(null);
    fetch(`/api/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMembers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  return (
    <section className="flex overflow-hidden flex-col items-start px-5 pt-5 mt-2 w-full bg-white rounded shadow-[0px_3px_7px_rgba(0,0,0,0.133)] max-md:max-w-full">
      <div className="flex items-center px-7 py-2 w-full h-[91px]">
        <div className="flex flex-col gap-2 w-full">
          <header className="flex gap-1 items-center">
            <h2 className="text-xl font-semibold text-black text-opacity-90">Members</h2>
            <span className="px-0 py-0.5 text-sm rounded-2xl bg-zinc-100 h-[21px] text-stone-500 w-[31px] text-center">
              {loading ? '...' : members.length}
            </span>
          </header>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {loading && <div className="text-sm text-gray-500">Loading members...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!loading && !error && members.length === 0 && (
              <div className="text-sm text-gray-500">No members found</div>
            )}
            {!loading && !error && members.map((member, index) => (
              <div key={member._id || index} className="flex items-center gap-2 mb-2">
                <div className="w-[32px] h-[32px] rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {member.name ? member.name[0] : 'U'}
                </div>
                <span className="text-sm text-gray-700">{member.name || member.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectMembersSection; 