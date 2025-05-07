"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function InvalidEmailChecker({
  onDetected,
}: {
  onDetected: () => void;
}) {
  const searchparams = useSearchParams();

  useEffect(() => {
    const errorParam = searchparams.get("error");
    if (
      errorParam === "invalid_email" ||
      sessionStorage.getItem("invalidLogin") === "true"
    ) {
      onDetected();
      sessionStorage.setItem("invalidLogin", "true");
    }
  }, [searchparams, onDetected]);

  return null;
}
