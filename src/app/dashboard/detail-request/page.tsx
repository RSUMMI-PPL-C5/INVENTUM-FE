"use client";

import { useSearchParams } from "next/navigation";
import RequestDetail from "@/modules/request-details/request-detail";

export default function RequestDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const type = searchParams.get('type') || '';
  
  const requestType = type.toUpperCase() === "CALIBRATION" 
    ? "CALIBRATION" 
    : "MAINTENANCE";
    
  return <RequestDetail id={id} requestType={requestType as 'CALIBRATION' | 'MAINTENANCE'} />;
}