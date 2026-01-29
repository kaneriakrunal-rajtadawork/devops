import PipelinesEmptyState from './Pipelines.js';

const PipelinesRouter = ({ projectName, submenu }) => {
    const renderPipelinesSubmenu = () => {
        switch (submenu) {
            case 'environments':
                return <PipelinesEmptyState />;
            case 'releases':
                return <PipelinesEmptyState />;
            case 'xaml':
                return <PipelinesEmptyState />;
            default:
                return <PipelinesEmptyState />;
        }
    };

    return (
        <div className="pipelines-menu">
            {renderPipelinesSubmenu()}
        </div>
    );
};

export default PipelinesRouter;