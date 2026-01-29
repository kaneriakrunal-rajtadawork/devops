import WikiSection from "./wiki/index";
import SummarySection from "./summary/index";
import DashboardPage from './dashboard/Dashboard';

const OverviewRouter =({ projectName, submenu }) => {
    const renderOverviewSubMenu = () => {
        switch (submenu) {
            case 'wiki':
                return <WikiSection />
            case 'summary':
                return <SummarySection projectName={projectName} />
            case 'dashboard':
                return <DashboardPage />
            default:
                return <SummarySection projectName={projectName} />
        }
    }

    return (
        <div className='overview-menu'>
            {renderOverviewSubMenu()}
        </div>
    )
}

export default OverviewRouter;