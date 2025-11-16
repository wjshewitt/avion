"use client";

import { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";
import { usePathname } from "next/navigation";
import { getBreadcrumbs } from "@/lib/utils/breadcrumbs";

interface FlightData {
  origin: string;
  destination: string;
}

export function FlightBreadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(getBreadcrumbs(pathname));

  useEffect(() => {
    // Check if we're on a flight detail page
    if (pathname.startsWith("/flights/") && pathname !== "/flights/create") {
      const flightId = pathname.split("/")[2];

      // Fetch flight data to get origin and destination
      const fetchFlightRoute = async () => {
        try {
          const response = await fetch(`/api/flights/${flightId}`);
          if (response.ok) {
            const flight: FlightData = await response.json();
            
            // Update breadcrumb with route format
            setBreadcrumbs([
              { label: "Operations", href: "/" },
              { label: "Flights", href: "/flights" },
              { label: `${flight.origin}-${flight.destination}` },
            ]);
          } else {
            // Fallback if fetch fails
            setBreadcrumbs([
              { label: "Operations", href: "/" },
              { label: "Flights", href: "/flights" },
              { label: "Flight Details" },
            ]);
          }
        } catch (error) {
          // Fallback on error
          setBreadcrumbs([
            { label: "Operations", href: "/" },
            { label: "Flights", href: "/flights" },
            { label: "Flight Details" },
          ]);
        }
      };

      fetchFlightRoute();
    } else {
      // For non-flight pages, use the standard breadcrumb logic
      setBreadcrumbs(getBreadcrumbs(pathname));
    }
  }, [pathname]);

  return <Breadcrumb items={breadcrumbs} />;
}

export default FlightBreadcrumb;
