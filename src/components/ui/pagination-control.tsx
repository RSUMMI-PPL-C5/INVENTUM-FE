"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useEffect, useState } from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []

    // For mobile, use more compact pagination
    if (isMobile) {
      // Always show current page
      pages.push(currentPage);
      
      // Show next page if it exists
      if (currentPage < totalPages) {
        pages.push(currentPage + 1);
      }
      
      // Show previous page if it exists and we're not on the first few pages
      if (currentPage > 1) {
        pages.unshift(currentPage - 1);
      }
      
      // If we're far from the start, add the first page and ellipsis
      if (currentPage > 3) {
        pages.unshift("ellipsis-start");
        pages.unshift(1);
      } else if (currentPage === 3) {
        // If we're on page 3, explicitly show page 1
        pages.unshift(1);
      }
      
      // If we're far from the end, add the last page and ellipsis
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
        pages.push(totalPages);
      } else if (currentPage === totalPages - 2) {
        // If we're on the third-to-last page, explicitly show the last page
        pages.push(totalPages);
      }
      
      return pages;
    }

    // Desktop pagination logic (unchanged)
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis-start")
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end")
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
        </PaginationItem>

        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink isActive={page === currentPage} onClick={() => onPageChange(Number(page))}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
