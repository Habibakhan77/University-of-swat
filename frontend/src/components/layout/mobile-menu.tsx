"use client";

import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { MobileMenuProps } from "./mobile-sheet";

export type { MobileMenuLabels, MobileMenuProps } from "./mobile-sheet";

/** The sheet duplicates the whole navigation, so its code and markup load on first hover, focus or tap. */
const MobileSheet = dynamic(() => import("./mobile-sheet"), { ssr: false });

/** Menu button for phones and tablets; all the page loads up front for the mobile menu. */
export function MobileMenu(props: MobileMenuProps) {
  const [wanted, setWanted] = useState(false);
  const [openRequest, setOpenRequest] = useState(0);
  const [open, setOpen] = useState(false);
  const prepare = () => setWanted(true);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setWanted(true);
          setOpenRequest((n) => n + 1);
        }}
        onPointerEnter={prepare}
        onFocus={prepare}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${buttonVariants({ variant: "ghost", size: "icon" })} xl:hidden`}
      >
        <Menu aria-hidden className="size-5!" />
        <span className="sr-only">{props.labels.open}</span>
      </button>
      {wanted ? <MobileSheet {...props} openRequest={openRequest} onOpenChange={setOpen} /> : null}
    </>
  );
}
