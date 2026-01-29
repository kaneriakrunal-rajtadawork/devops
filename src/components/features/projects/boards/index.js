// src/components/features/projects/boards/BoardsRouter.js
import WorkItems from './workItems';
import Boards from './Boards';
import Queries from './Queries';
import Sprints from './Sprints';
import DeliveryPlans from './DeliveryPlans';
import AnalyticsViews from './AnalyticsViews';
import WorkItemsRouter from './workItems/WorkItemsRouter';
import BackLogs from "./BackLogs";

const BoardsRouter = ({ projectName, submenu, action, subAction }) => {
    const renderBoardsSubmenu = () => {
        switch (submenu) {
            case 'work-items':
                // Delegate to WorkItemsRouter for nested routes
                return <WorkItemsRouter projectName={projectName} action={action} subAction={subAction} />;
            case 'backlogs':
                return <BackLogs projectName={projectName} />;
            case 'boards':
                return <Boards projectName={projectName} />;
            case 'queries':
                return <Queries projectName={projectName} />;
            case 'sprints':
                return <Sprints projectName={projectName} />;
            case 'delivery-plans':
                return <DeliveryPlans projectName={projectName} />;
            case 'analytics-views':
                return <AnalyticsViews projectName={projectName} />;
            default:
                return <WorkItems projectName={projectName} />;
        }
    };

    return (
        <div className="boards-menu">
            {renderBoardsSubmenu()}
        </div>
    );
};

export default BoardsRouter;