"use client";

import { Fragment } from "react";
import { JSX, useState } from "react";
import {
	TwoUsers,
	Heart2,
	Category,
	Setting,
	Chart,
	Activity,
	User,
	Logout,
} from "react-iconly";
import SideBarButton from "./sidebar-button";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";

interface MenuItem {
	label: string;
	icon: JSX.Element;
	route: string;
}

const menuItems: MenuItem[] = [
	{
		label: "Pengguna",
		icon: <TwoUsers set="curved" stroke="bold" filled />,
		route: "/dashboard/user",
	},
	{
		label: "Daftar Alat Medis",
		icon: <Heart2 set="curved" stroke="bold" filled />,
		route: "/dashboard/medical-equipment",
	},
	{
		label: "Daftar Suku Cadang",
		icon: <Category set="curved" stroke="bold" filled />,
		route: "/dashboard/spare-part",
	},
	{
		label: "Permintaan Maintenance",
		icon: <Setting set="curved" stroke="bold" filled />,
		route: "/dashboard/maintenance-request",
	},
	{
		label: "Permintaan Kalibrasi",
		icon: <Chart set="curved" stroke="bold" filled />,
		route: "/dashboard/calibration-request",
	},
	{
		label: "Laporan",
		icon: <Activity set="curved" stroke="bold" filled />,
		route: "/dashboard/report",
	},
];

export default function SideBar() {
	const [isHovered, setIsHovered] = useState(false);

	const router = useRouter();
    const pathname = usePathname();

	const handleLogout = () => {
		Cookies.remove("token");
		router.push("/");
	};

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
						<Fragment key={item.route}>
							<SideBarButton
								icon={item.icon}
								isHovered={isHovered}
                                isActive={pathname === item.route}
								onClick={() => {
									pathname !== item.route && router.push(item.route);
								}}
							>
								{item.label}
							</SideBarButton>
							{[0, 2, 4].includes(index) && (
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
								Azmy Arya Rizaldi
							</span>
							<span className="text-xs-medium">Admin</span>
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