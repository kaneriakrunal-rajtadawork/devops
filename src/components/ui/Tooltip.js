import { Tooltip as MuiTooltip } from "@mui/material";
import Fade from '@mui/material/Fade';

const Tooltip = ({ children, title, placement = 'bottom' }) => {
    return (
        <MuiTooltip
            slots={{
                transition: Fade
            }}
            enterDelay={500}
            leaveDelay={200}
            slotProps={{
                transition: {
                    timeout: 100
                },
                tooltip: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.94)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 400,
                        padding: '8px 12px',
                        borderRadius: '4px',
                        maxWidth: 300,
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                    }
                },
            }}
            title={title}
            placement={placement}
        >
            {children}
        </MuiTooltip>
    );
};

export default Tooltip;