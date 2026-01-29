'use client';
import React from 'react';
import Link from 'next/link';
import { setProject } from '@/store/projectSlice';
import { useDispatch } from 'react-redux';

function getInitials(name) {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const colorPalette = [
  'bg-pink-600', 'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-red-700', 'bg-yellow-600', 'bg-indigo-600'
];
function getColor(name) {
  if (!name) return colorPalette[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

const ProjectCard = ({ name, description, ...extraProps }) => {

  const initials = getInitials(name);
  const color = getColor(name);
  const dispatch = useDispatch();

  const onProjectCardClick = () => {
    dispatch(setProject({ name, description, ...extraProps }));
  };

  return (
    <Link href={`/projects/${encodeURIComponent(name)}`} passHref legacyBehavior>
    <div onClick={onProjectCardClick} className="bg-white rounded-lg shadow-sm p-4 flex flex-col min-h-[200px] h-full cursor-pointer transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded text-white text-xl font-bold ${color}`}>
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-black text-lg leading-tight mb-1 truncate">{name}</div>
        </div>
      </div>
      <div className={`mt-2 ${description ? '' : 'invisible h-5'}`}>
        {description && (
          <div className="text-sm text-gray-600 line-clamp-2">{description}</div>
        )}
      </div>
    </div>
    </Link>
  );
};

export default ProjectCard;
