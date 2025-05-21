"use client";

import React, { useEffect, useState } from "react";
import { Notification } from "react-iconly";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

interface NotificationBellProps {
	count?: number;
	notifications?: {
		id: string;
		title: string;
		message: string;
		timestamp: string;
		read: boolean;
		type?: "info" | "success" | "warning" | "error";
	}[];
	onNotificationClick?: (id: string) => void;
	onMarkAllAsRead?: () => void;
}

export function NotificationBell({
	count = 0,
	notifications = [],
	onNotificationClick,
	onMarkAllAsRead,
}: NotificationBellProps) {
	const [open, setOpen] = useState(false);

	const [isMobile, setIsMobile] = useState(false);

	// Check if the screen is mobile size
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Check on mount
		handleResize();

		// Add listener for window resize
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Filter to only show unread notifications in the dropdown
	const unreadNotifications = notifications.filter((n) => !n.read);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
					aria-label="Notifications"
				>
					<Notification
						set="curved"
						stroke="bold"
						primaryColor="black"
						size={isMobile ? "medium" : "large"}
						filled
					/>
					{count > 0 && (
						<span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm font-bold text-white bg-red-500 rounded-full">
							{count > 99 ? "99+" : count}
						</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-72 sm:w-96 p-0"
				sideOffset={5}
			>
				<div className="flex items-center justify-between p-3 sm:p-4 border-b">
					<h3 className="text-base sm:text-lg font-medium">
						Notifikasi
					</h3>
					{count > 0 && (
						<button
							onClick={onMarkAllAsRead}
							className="text-sm sm:text-base text-blue-600 hover:underline"
						>
							Tandai semua sudah dibaca
						</button>
					)}
				</div>
				<div className="max-h-80 overflow-y-auto">
					{unreadNotifications.length === 0 ? (
						<div className="p-3 sm:p-4 text-center text-sm sm:text-base text-muted-foreground">
							Tidak ada notifikasi baru
						</div>
					) : (
						<div className="divide-y">
							{unreadNotifications.map((notification) => (
								<button
									key={notification.id}
									className="w-full text-left p-3 sm:p-4 hover:bg-gray-50 transition-colors bg-blue-50"
									onClick={() =>
										onNotificationClick?.(notification.id)
									}
								>
									<div className="flex justify-between mb-1">
										<span className="font-medium text-sm sm:text-base text-blue-800">
											{notification.title}
										</span>
										<span className="text-sm sm:text-base text-muted-foreground">
											{notification.timestamp}
										</span>
									</div>
									<p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
										{notification.message}
									</p>
								</button>
							))}
						</div>
					)}
				</div>
				<div className="p-3 sm:p-4 border-t text-center">
					<Link
						href="/dashboard/notification"
						className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
					>
						Lihat semua notifikasi
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
