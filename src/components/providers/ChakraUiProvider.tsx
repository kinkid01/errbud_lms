"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useIsClient } from "@/hooks/useIsClient";

interface ChakraUiProviderProps {
  children: ReactNode;
}

export default function ChakraUiProvider({ children }: ChakraUiProviderProps) {
  const isClient = useIsClient();

  // Only render ChakraProvider on client-side to prevent hydration issues
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <ChakraProvider
      toastOptions={{
        defaultOptions: {
          position: 'top',
          duration: 4000,
          isClosable: true,
        },
      }}
    >
      {children}
    </ChakraProvider>
  );
}