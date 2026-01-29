"use client";

import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetRepoFiles } from '@/api-client';
import { CircularProgress } from '@mui/material';

export default function FilesList() {
  const { selectedRepo, selectedBranch } = useSelector((state) => state.repo);

  const { data: repoFiles, isLoading, error } = useGetRepoFiles(selectedRepo?.id, {branchName: selectedBranch}, {
    query: {
      enabled: !!selectedRepo?.id && !!selectedBranch,
      queryKey: ['repo-files', selectedRepo?.id, selectedBranch],
    },
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Error loading files</div>;

  return (
    <div>
      {repoFiles.length === 0 ? (
        <div>No files found</div>
      ) : (
        <ul>
          {repoFiles.map((file) => (
            <li key={file.id}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}