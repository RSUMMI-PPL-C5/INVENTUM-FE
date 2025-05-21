import Breadcrumb from "@/components/general/breadcrumb";
import SideBar from "@/components/general/sidebar";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
        <div className="h-screen flex md:pt-4 md:pb-4 md:pr-4">
            <SideBar />
            <div data-testid="main" className="flex flex-col gap-8 w-full h-full p-4 md:p-8 z-10 shadow bg-white rounded-lg shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)] overflow-auto">
                <div className="md:ml-0 ml-16 md:mt-0 mt-2">
                    <Breadcrumb />
                </div>
                {children}
            </div>
        </div>
	);
}
