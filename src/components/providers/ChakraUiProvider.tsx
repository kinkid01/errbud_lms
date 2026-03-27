"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ChakraUiProviderProps {
  children: ReactNode;
}

export default function ChakraUiProvider({ children }: ChakraUiProviderProps) {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  );
}