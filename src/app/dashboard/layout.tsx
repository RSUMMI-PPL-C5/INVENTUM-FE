import Breadcrumb from "@/components/general/breadcrumb";
import SideBar from "@/components/general/sidebar";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<div className="h-screen flex pt-4 pb-4 pr-4">
					<SideBar />
                    <div data-testid="main" className="flex flex-col gap-8 w-full h-full p-8 z-10 shadow bg-white rounded-lg shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)]">
                       <Breadcrumb />
					    {children}
                    </div>
				</div>
			</body>
		</html>
	);
}
