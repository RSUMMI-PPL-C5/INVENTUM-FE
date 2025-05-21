"use client";

import { type JSX, Fragment, useState, useEffect } from "react";
import {
	TwoUsers,
	Heart2,
	Category,
	Setting,
	Chart,
	Activity,
	User,
	Logout,
	Graph,
} from "react-iconly";
import SideBarButton from "./sidebar-button";
import { Squash as Hamburger } from "hamburger-react";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { decodeToken } from "@/lib/utils";

interface MenuItem {
	label: string;
	icon: JSX.Element;
	route: string;
    role: string[];
}

interface UserData {
	id: number;
	fullname: string;
	role: string;
}

const menuItems: MenuItem[] = [
	{
		label: "Pengguna",
		icon: <TwoUsers set="curved" stroke="bold" filled />,
		route: "/dashboard/user",
        role: ["Admin"],
	},
	{
		label: "Divisi",
		icon: <Graph set="curved" stroke="bold" filled />,
		route: "/dashboard/division",
        role: ["Admin"],
	},
	{
		label: "Daftar Alat Medis",
		icon: <Heart2 set="curved" stroke="bold" filled />,
		route: "/dashboard/medical-equipment",
        role: ["Admin", "Fasum", "User"],
	},
	{
		label: "Daftar Suku Cadang",
		icon: <Category set="curved" stroke="bold" filled />,
		route: "/dashboard/spare-part",
        role: ["Admin", "Fasum", "User"],
	},
	{
		label: "Permintaan Maintenance",
		icon: <Setting set="curved" stroke="bold" filled />,
		route: "/dashboard/maintenance-request",
        role: ["Admin", "Fasum", "User"],
	},
	{
		label: "Permintaan Kalibrasi",
		icon: <Chart set="curved" stroke="bold" filled />,
		route: "/dashboard/calibration-request",
        role: ["Admin", "Fasum", "User"],
	},
	{
		label: "Laporan",
		icon: <Activity set="curved" stroke="bold" filled />,
		route: "/dashboard/report",
        role: ["Admin", "Fasum"],
	},
];

export default function SideBar() {
	const [isHovered, setIsHovered] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [role, setRole] = useState("");
	const [isMobile, setIsMobile] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

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

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = Cookies.get("accessToken");

				if (!token) {
					console.error("No token found");
					setLoading(false);
					return;
				}

				const user = decodeToken(token);


				Cookies.set("user", JSON.stringify(user));

				if (!user.userId) {
					console.error("Invalid token or userId not found in token");
					setLoading(false);
					return;
				}

				setUserData(user);
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setLoading(false);
			}
		};

		if (typeof document !== "undefined") {

            const user = Cookies.get("user")
            
            if (user) {
                const { role } = JSON.parse(user)
                setRole(role);
            }

			fetchUserData();
		}
	}, []);

	useEffect(() => {
		// Close sidebar when route changes on mobile
		if (isMobile) {
			setIsOpen(false);
		}
	}, [pathname, isMobile]);

	const handleLogout = () => {
		Cookies.remove("accessToken");
		router.push("/");
	};

	// Mobile Sidebar Toggle Button
	const BurgerButton = () => (
		<div className="fixed top-4 left-4 z-50 bg-primary-solid shadow-md rounded-lg">
			<Hamburger 
				toggled={isOpen} 
				toggle={setIsOpen}
				size={20}
				color="#fff"
				rounded
				label="Show menu"
				distance="md"
				duration={0.3}
			/>
		</div>
	);

	// For desktop
	if (!isMobile) {
		return (
			<div
				data-testid="sidebar"
				className={`h-full flex flex-col justify-between pl-4 pr-3 py-2 transition-all duration-200 ${
					isHovered ? "w-72" : "w-[5.25rem]"
				}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<div className="flex flex-col gap-6">
					<span className="text-header-h6 font-poppins text-primary-solid pl-2">
						{isHovered ? "INVENTUM" : "IN"}
					</span>
					<div className="flex flex-col gap-2 items-start text-nowrap">
						{menuItems.map((item, index) => (
							item.role.includes(role) &&
								<Fragment key={item.route}>
									<SideBarButton
										icon={item.icon}
										isHovered={isHovered}
										isActive={pathname.startsWith(item.route)}
										onClick={() => {
											if (pathname !== item.route)
												router.push(item.route);
										}}
									>
										{item.label}
									</SideBarButton>
									{[1, 3, 5].includes(index) && (
										<hr className="w-full min-w-[3.5rem] border-1 border-[#C2C2C2]" />
									)}
								</Fragment>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex px-2 py-3 gap-3 bg-white rounded-lg w-full text-nowrap shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)]">
						<div className="rounded-full bg-primary-solid p-2">
							<User
								set="curved"
								stroke="bold"
								primaryColor="white"
								filled
							/>
						</div>
						{isHovered && (
							<div className="flex flex-col w-fit truncate">
								<span className="text-s-semibold truncate">
									{loading
										? "Loading..."
										: userData?.fullname || "User"}
								</span>
								<span className="text-xs-medium">
									{loading
										? ""
										: userData
										? userData.role
										: "Guest"}
								</span>
							</div>
						)}
					</div>
					<SideBarButton
						color="#DA5249"
						icon={
							<Logout
								set="curved"
								stroke="bold"
								primaryColor="#DA5249"
								filled
							/>
						}
						isHovered={isHovered}
						onClick={handleLogout}
					>
						Keluar
					</SideBarButton>
				</div>
			</div>
		);
	}

	// For mobile
	return (
		<>
			<BurgerButton />
			{isOpen && (
				<div
					onClick={() => setIsOpen(false)}
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
				/>
			)}
			<div
				data-testid="sidebar"
				className={`fixed top-0 left-0 h-full flex flex-col justify-between pl-4 pr-3 py-6 bg-white transition-transform duration-300 transform z-50 shadow-lg w-72 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col gap-6">
					<span className="text-header-h6 font-poppins text-primary-solid pl-2">
						INVENTUM
					</span>
					<div className="flex flex-col gap-2 items-start text-nowrap">
						{menuItems.map((item, index) => (
							item.role.includes(role) &&
								<Fragment key={item.route}>
									<SideBarButton
										icon={item.icon}
										isHovered={true}
										isActive={pathname.startsWith(item.route)}
										onClick={() => {
											if (pathname !== item.route)
												router.push(item.route);
										}}
									>
										{item.label}
									</SideBarButton>
									{[1, 3, 5].includes(index) && (
										<hr className="w-full min-w-[3.5rem] border-1 border-[#C2C2C2]" />
									)}
								</Fragment>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex px-2 py-3 gap-3 bg-white rounded-lg w-full text-nowrap shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)]">
						<div className="rounded-full bg-primary-solid p-2">
							<User
								set="curved"
								stroke="bold"
								primaryColor="white"
								filled
							/>
						</div>
						<div className="flex flex-col w-fit truncate">
							<span className="text-s-semibold truncate">
								{loading
									? "Loading..."
									: userData?.fullname || "User"}
							</span>
							<span className="text-xs-medium">
								{loading
									? ""
									: userData
									? userData.role
									: "Guest"}
							</span>
						</div>
					</div>
					<SideBarButton
						color="#DA5249"
						icon={
							<Logout
								set="curved"
								stroke="bold"
								primaryColor="#DA5249"
								filled
							/>
						}
						isHovered={true}
						onClick={handleLogout}
					>
						Keluar
					</SideBarButton>
				</div>
			</div>
		</>
	);
}
