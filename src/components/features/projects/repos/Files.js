'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Copy, ChevronDown, Monitor, Info, GitBranch, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetGithubRepoDetails, useGetRepoFiles } from '@/api-client';
import BranchList from '@/components/ui/BranchList';
import FileExplorer from './FileExplorer';
import AzureDevOpsFileList from './AzureDevOpsFileList';
import AzureDevOpsCombinedView from './AzureDevOpsCombinedView';
import FileViewer from './FileViewer';
import PathBreadcrumb from './PathBreadcrumb';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow p-3 mb-6">{children}</div>
);

const Banner = () => {
  const {selectedRepo} = useSelector((state) => state.repo);
  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-3 text-sm flex items-center">
      <Info className="w-5 h-5 mr-2" />
      {
        !selectedRepo || Object.keys(selectedRepo).length === 0 ?
        "Select a repository to see its details." :
        "This is a new repository with no files."
      }
    </div>
  );
};

const CloneSection = ({ repoDetails }) => {
  const [protocol, setProtocol] = useState('HTTPS');
  const cloneUrl = protocol === "HTTPS" ? repoDetails?.clone_url : repoDetails?.ssh_url;

  return (
    <Card>
      <div className="font-semibold text-lg mb-4">Clone to your computer</div>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${protocol === 'HTTPS' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setProtocol('HTTPS')}
          >
            HTTPS
          </button>
          <button
            className={`px-3 py-1 rounded ${protocol === 'SSH' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setProtocol('SSH')}
          >
            SSH
          </button>
        </div>
        <div className="flex flex-1 min-w-0">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-sm bg-gray-50"
            value={cloneUrl}
            readOnly
          />
          <button
            className="border border-l-0 rounded-r px-3 py-2 bg-gray-50 hover:bg-gray-100"
            onClick={() => navigator.clipboard.writeText(cloneUrl)}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <span className="mx-2 font-semibold text-gray-500 hidden md:inline">OR</span>
        <div className="flex">
          <button className="flex items-center px-3 py-2 border rounded-l bg-gray-50 hover:bg-gray-100">
            <Monitor className="w-4 h-4 mr-2" />
            Clone in VS Code
          </button>
          <button className="border border-l-0 rounded-r px-2 py-2 bg-gray-50 hover:bg-gray-100">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <a
          href="https://go.microsoft.com/fwlink/?LinkID=2295311"
          target="_blank"
          rel="noopener"
          className="text-blue-600 hover:underline text-sm"
        >
          Learn more about HTTPS
        </a>
        <button className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm w-fit">
          Generate Git Credentials
        </button>
      </div>
      <div className="flex items-start text-xs text-gray-600 mt-3">
        <Info className="w-4 h-4 mt-0.5 mr-1" />
        Having problems authenticating in Git? Be sure to get the latest version{' '}
        <a href="https://go.microsoft.com/fwlink/?LinkID=278817&clcid=0x409" className="underline" target="_blank" rel="noopener">Git for Windows</a>
        {' '}or our plugins for{' '}
        <a href="https://go.microsoft.com/fwlink/?LinkID=723021" className="underline" target="_blank" rel="noopener">IntelliJ</a>,{' '}
        <a href="https://go.microsoft.com/fwlink/?LinkID=723023" className="underline" target="_blank" rel="noopener">Eclipse</a>,{' '}
        <a href="https://go.microsoft.com/fwlink/?LinkId=723132" className="underline" target="_blank" rel="noopener">Android Studio</a>{' '}or{' '}
        <a href="https://go.microsoft.com/fwlink/?LinkID=723024" className="underline" target="_blank" rel="noopener">Windows command line</a>.
      </div>
    </Card>
  );
};

const PushSection = ({repoDetails}) => {
  const [protocol, setProtocol] = useState('HTTPS');
  const command = `git remote add origin ${protocol === 'HTTPS' ? repoDetails?.clone_url : repoDetails?.ssh_url}\ngit push -u origin --all`;
  return (
    <Card>
      <div className="font-semibold text-lg mb-4">Push an existing repository from command line</div>
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded ${protocol === 'HTTPS' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setProtocol('HTTPS')}
        >
          HTTPS
        </button>
        <button
          className={`px-3 py-1 rounded ${protocol === 'SSH' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setProtocol('SSH')}
        >
          SSH
        </button>
      </div>
      <div className="flex">
        <textarea
          className="flex-1 border rounded-l px-3 py-2 text-sm bg-gray-50"
          rows={2}
          value={command}
          readOnly
        />
        <button
          className="border border-l-0 rounded-r px-3 py-2 bg-gray-50 hover:bg-gray-100"
          onClick={() => navigator.clipboard.writeText(command)}
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

const ImportSection = () => (
  <Card>
    <div className="flex items-center justify-between">
      <div className="font-semibold text-lg">Import a repository</div>
      <button className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200">Import</button>
    </div>
  </Card>
);

const InitializeSection = ({repoDetails}) => {
  const [addReadme, setAddReadme] = useState(true);
  const [gitignore, setGitignore] = useState('None');
  const gitignoreOptions = ['None', 'Node', 'Python', 'Java', 'Go', 'C#'];
  return (
    <Card>
      <div className="font-semibold text-lg mb-4 flex items-center">
        Initialize <GitBranch className="w-5 h-5 mx-1" /> <span className="font-mono">main</span> branch with a README or gitignore
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={addReadme}
            onChange={() => setAddReadme(v => !v)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          Add a README
        </label>
        <div className="flex items-center gap-2">
          <span>Add a .gitignore:</span>
          <select
            className="border rounded px-2 py-1"
            value={gitignore}
            onChange={e => setGitignore(e.target.value)}
          >
            {gitignoreOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700">Initialize</button>
      </div>
    </Card>
  );
};

const FilesPage = () => {
  const {selectedRepo, selectedBranch} = useSelector((state) => state.repo);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewType, setViewType] = useState('combined'); // 'azure', 'explorer', or 'combined'

  const {data:githubRepoDetails, isLoading, error} = useGetGithubRepoDetails(selectedRepo?.githubRepoId, { query:{enabled: !!selectedRepo?.githubRepoId, queryKey: ['github-repo', selectedRepo?.githubRepoId]} });

   const { data: repoFiles, isLoading:loadingFiles, error:filesError } = useGetRepoFiles(selectedRepo?.id, {branchName: selectedBranch}, {
      query: {
        enabled: !!selectedRepo?.githubRepoId && !!selectedBranch,
        queryKey: ['repo-files', selectedRepo?.githubRepoId, selectedBranch],
      },
  });


  const hasFiles = repoFiles?.data?.data?.length > 0;

  return (
  <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
    <Banner />
    <div className="flex-1 flex flex-col p-3 overflow-hidden">
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading repository details...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          Error loading repository: {error}
        </div>
      )}

      {/* Branch Selection and View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <section className='w-1/3'>
          {githubRepoDetails && <BranchList />}
        </section>
     
      </div>

      {/* File Explorer or Empty State */}
      {githubRepoDetails && selectedBranch && !loadingFiles && (
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          {hasFiles ? (
            <AzureDevOpsCombinedView />
          ) : (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">
                {githubRepoDetails?.data?.data?.github?.name || 'Repository'} is empty. Add some code!
              </h1>
              <div className="space-y-6">
                <CloneSection repoDetails={githubRepoDetails?.data?.data?.github} />
                <PushSection repoDetails={githubRepoDetails?.data?.data?.github} />
                <ImportSection />
                <InitializeSection repoDetails={githubRepoDetails?.data?.data?.github} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* File Viewer Modal */}
    {selectedFile && (
      <FileViewer 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)}
        repositoryName={githubRepoDetails?.data?.data?.github?.name}
      />
    )}
  </div>
  );
};

export default FilesPage;