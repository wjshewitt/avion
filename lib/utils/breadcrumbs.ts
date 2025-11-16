import { BreadcrumbItem } from "@/components/ui/breadcrumb";

/**
 * Generate breadcrumb items based on the current pathname
 */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Root/Dashboard
  if (pathname === "/") {
    return [
      { label: "Operations", href: "/" },
      { label: "Dashboard", href: "/" },
      { label: "Overview" },
    ];
  }

  // Flights
  if (pathname === "/flights") {
    return [
      { label: "Operations", href: "/" },
      { label: "Flights", href: "/flights" },
      { label: "Overview" },
    ];
  }

  if (pathname === "/flights/create") {
    return [
      { label: "Operations", href: "/" },
      { label: "Flights", href: "/flights" },
      { label: "Create" },
    ];
  }

  // Flight detail
  if (pathname.startsWith("/flights/") && pathname !== "/flights/create") {
    // For flight details, we'll show a route format
    // The actual route will be fetched client-side or server-side
    // For now, use a placeholder that will be replaced
    return [
      { label: "Operations", href: "/" },
      { label: "Flights", href: "/flights" },
      { label: "Loading..." }, // Will be replaced with actual route
    ];
  }

  // Weather
  if (pathname === "/weather") {
    return [
      { label: "Information", href: "/" },
      { label: "Weather", href: "/weather" },
      { label: "Overview" },
    ];
  }

  if (pathname.startsWith("/weather/briefing/")) {
    const icao = pathname.split("/")[3];
    return [
      { label: "Information", href: "/" },
      { label: "Weather", href: "/weather" },
      { label: icao.toUpperCase(), href: `/weather/${icao}` },
      { label: "Briefing" },
    ];
  }

  if (pathname.startsWith("/weather/") && !pathname.includes("/briefing/")) {
    const icao = pathname.split("/")[2];
    return [
      { label: "Information", href: "/" },
      { label: "Weather", href: "/weather" },
      { label: icao.toUpperCase() },
    ];
  }

  // Airports
  if (pathname === "/airports") {
    return [
      { label: "Information", href: "/" },
      { label: "Airports", href: "/airports" },
      { label: "Overview" },
    ];
  }

  if (pathname.startsWith("/airports/")) {
    const icao = pathname.split("/")[2];
    return [
      { label: "Information", href: "/" },
      { label: "Airports", href: "/airports" },
      { label: icao.toUpperCase() },
    ];
  }

  // Chat
  if (pathname === "/chat-enhanced") {
    return [
      { label: "Tools", href: "/" },
      { label: "Chat", href: "/chat-enhanced" },
      { label: "Overview" },
    ];
  }

  // Settings
  if (pathname === "/settings") {
    return [
      { label: "Tools", href: "/" },
      { label: "Settings", href: "/settings" },
      { label: "Overview" },
    ];
  }

  // Default fallback
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Operations", href: "/" }];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      href: isLast ? undefined : href,
    });
  });

  return breadcrumbs;
}
