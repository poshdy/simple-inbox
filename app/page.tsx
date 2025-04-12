"use client";

import { Button } from "@/components/ui/button";
import Authorize from "@/lib/authorize";

export default function Home() {
  return (
    <section>
      home
      <Button
        onClick={async () => {
          const url = await Authorize("Google");

          if (url) {
            window.location.href = url;
          }
        }}
      >
        Link gmail
      </Button>
    </section>
  );
}
