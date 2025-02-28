"use client"

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { JSX } from "react";

interface SideBarButtonProps {
    color?: string;
    label: string;
    icon: JSX.Element;
    route: string;
    isHovered: boolean;
}

export default function SideBarButton({ label, color, icon, route, isHovered }: SideBarButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname === route

    if (!router) {
        console.error('router is not available');
        return;
    }

    if (!pathname) {
        console.error('Pathname is not available');
        return;
    }

    return (
        <button
            className={cn("px-4 py-3 w-full flex items-center gap-3 rounded-lg hover:bg-primary-solid/5", isActive && 'bg-primary-solid/10')}
            onClick={() => router.push(route)}
        >
            <span>{icon}</span>
            {isHovered &&
                <span
                    className='text-s-regular transition-all duration-150'
                    style={{ color }}
                >
                    {label}
                </span>
            }
        </button>
    );
}