import React from "react";
import { cn } from "@/lib/utils";

interface SideBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    color?: string;
    isActive?: boolean;
    isHovered: boolean;
    onClick: () => void;
}

const SideBarButton: React.FC<SideBarButtonProps> = ({
    color,
    icon,
    isActive,
    isHovered,
    onClick,
    ...props
}) => {

    return (
        <button
            {...props}
            className={cn(
                "px-4 py-3 w-full flex items-center gap-3 rounded-lg hover:bg-primary-solid/5",
                isActive && "bg-primary-solid/10",
                props.className
            )}
            onClick={onClick}
        >
            <span>{icon}</span>
            {isHovered && (
                <span
                    className="text-s-regular transition-all duration-150 truncate"
                    style={{ color }}
                >
                    {props.children}
                </span>
            )}
        </button>
    );
};

export default SideBarButton;
