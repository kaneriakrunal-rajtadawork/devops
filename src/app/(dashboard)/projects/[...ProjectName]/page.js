// src/app/projects/[ProjectName]/page.js
import React from 'react';
import ProjectMenuRouter from '@/components/features/projects/index';

const ProjectPage = async ({ params }) => {
    const resolvedParams = await params;
    const [ProjectName, menu, submenu, action, subAction] = await resolvedParams?.ProjectName;

    return (
        <div className="h-[94vh]">
            <ProjectMenuRouter 
                projectName={ProjectName}
                menu={menu?.toLowerCase()}
                submenu={submenu?.toLowerCase()}
                action={action?.toLowerCase()}
                subAction={subAction?.toLowerCase()}
            />
        </div>
    );
};

export default ProjectPage;