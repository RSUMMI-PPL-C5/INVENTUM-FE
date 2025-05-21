"use client";

import Link from "next/link";
import { ChevronRight, Notification } from 'react-iconly'
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Breadcrumb = () => {
	const pathname = usePathname();
	const [isMobile, setIsMobile] = useState(false);

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
                <Notification set="curved" stroke="bold" primaryColor="black" size={isMobile ? 'medium' : 'large'} filled />
            </div>
            <hr className="w-full min-w-[3.5rem] border-1 border-[#C2C2C2]" />
		</nav>
	);
};

export default Breadcrumb;