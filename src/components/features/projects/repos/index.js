// src/components/features/projects/repos/index.js
import FilesPage from '@/components/features/projects/repos/Files';
// Import other repos components as you create them
// import BranchesPage from './branches';
// import PullRequestsPage from './pull-requests';

const ReposRouter = ({ projectName, submenu }) => {
    const renderReposSubmenu = () => {
        switch (submenu) {
            case 'files':
                return <FilesPage projectName={projectName} />;
            // case 'branches':
            //     return <BranchesPage projectName={projectName} />;
            // case 'pull-requests':
            //     return <PullRequestsPage projectName={projectName} />;
            default:
                return <FilesPage projectName={projectName} />;
        }
    };

    return (
        <div className="repos-menu">
            {renderReposSubmenu()}
        </div>
    );
};

export default ReposRouter;