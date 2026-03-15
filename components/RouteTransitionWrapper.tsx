"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function RouteTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (loading) return;

  return <>{children}</>;
}
