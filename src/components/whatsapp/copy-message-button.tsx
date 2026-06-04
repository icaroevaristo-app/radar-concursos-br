"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyMessageButtonProps = {
  message: string;
};

export function CopyMessageButton({ message }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      onClick={async () => {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      {copied ? "Copiado" : "Copiar mensagem"}
    </Button>
  );
}
