import { Info, CircleX, CircleCheckBig, CircleAlert } from "lucide-react";
import PropTypes from "prop-types";

const BANNER_TYPES = {
    warning:"bg-orange-50 border border-orange-200 text-orange-800",
    error:"bg-red-50 border border-red-200 text-red-800",
    success:"bg-green-50 border border-green-200 text-green-800",
    info:"bg-blue-50 border border-blue-200 text-blue-800"
}

const BANNER_ICONS = {
    warning:CircleAlert,
    error:CircleX,
    success:CircleCheckBig,
    info:Info
}

const Banner = ({message, type="warning"}) => {

    const Icon = BANNER_ICONS[type];

    return (
        <div className={`${BANNER_TYPES[type]} px-4 py-3 rounded mb-3 text-sm flex items-center`}>
            <Icon className="w-5 h-5 mr-2" />
             <span>{message}</span>
        </div>
    );
}

Banner.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["warning", "error", "success", "info"])
}

export default Banner;