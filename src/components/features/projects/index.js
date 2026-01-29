// src/components/features/projects/ProjectMenuRouter.js
import ReposRouter from './repos';
import BoardsRouter from './boards';
import OverviewRouter from './overview';
import PipelinesRouter from './pipelines/index.js';
// Import other components as you create them
// import WorkItems from './boards/work-items/WorkItems';
// import PullRequests from './repos/pull-requests/PullRequests';

const ProjectMenuRouter = ({ ...params }) => {
    const { projectName, menu, submenu, action, subAction } = params;
    const renderMenuContent = () => {
        switch (menu) {
            case 'repos':
                return <ReposRouter projectName={projectName} submenu={submenu} />;
            case 'boards':
                return <BoardsRouter projectName={projectName} submenu={submenu} action={action} subAction={subAction} />;
            case 'overview':
                return <OverviewRouter projectName={projectName} submenu={submenu} />;
            case 'pipelines':
                return <PipelinesRouter projectName={projectName} submenu={submenu} />;
            case 'test-plans':
                return <div>Test Plans Component Placeholder</div>;
            case 'artifacts':
                return <div>Artifacts Component Placeholder</div>;
            default:
                return <OverviewRouter projectName={projectName} submenu={submenu} />;
        }
    };

    return (
        <div className="project-menu-container">
            <div className="menu-content">
                {renderMenuContent()}
            </div>
        </div>
    );
};

export default ProjectMenuRouter;