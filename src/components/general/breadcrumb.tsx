"use client";

import Link from "next/link";
import { ChevronRight } from 'react-iconly'
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useNotifications } from "@/context/notification-provider";

const Breadcrumb = () => {
	const pathname = usePathname();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

	const segments = pathname.split("/").filter((segment) => segment !== "").slice(1);

	const breadcrumbItems = segments.map((segment, index) => {
		const href = `/${segments.slice(0, index + 1).join("/")}`;
		const label = segment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			href,
			label,
		};
	});

	return (
		<nav aria-label="Breadcrumb" className="flex flex-col gap-2 items-start text-s-medium text-[#7B7B7B]">
            <div className="flex justify-between w-full items-center">
                <ol className="flex items-center space-x-2 overflow-auto whitespace-nowrap pb-1 max-w-[70vw] md:max-w-full">
                    {breadcrumbItems.map((item, index) => (
                        <li key={item.href} className="flex items-center">
                            {index !== 0 && <span className="mx-2"><ChevronRight size='small'/></span>}
                            {index === breadcrumbItems.length - 1 ? (
                                <span className="text-black">{item.label}</span>
                            ) : (
                                <Link href={`/dashboard/${item.href}`} className="hover:text-[#6A6A6A]">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
                <NotificationBell 
                    count={unreadCount} 
                    notifications={notifications.map(n => ({
                        id: n.id,
                        title: n.title || "Notification",
                        message: n.message,
                        timestamp: n.timestamp,
                        read: n.read,
                        type: n.type || "info"
                    }))}
                    onNotificationClick={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                />
            </div>
            <hr className="w-full min-w-[3.5rem] border-1 border-[#C2C2C2]" />
		</nav>
	);
};

export default Breadcrumb;