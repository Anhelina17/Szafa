import { useState } from "react";
import { removeBackground } from "../services/backgroundRemoval";

type RemovalState = {
  isLoading: boolean;
  error: string | null;
  resultUri: string | null;
};

export function useBackgroundRemoval() {
  const [state, setState] = useState<RemovalState>({
    isLoading: false,
    error: null,
    resultUri: null,
  });

  const process = async (imageUri: string) => {
    setState({ isLoading: true, error: null, resultUri: null });

    try {
      const resultUri = await removeBackground(imageUri);
      setState({ isLoading: false, error: null, resultUri });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wystąpił błąd";
      setState({ isLoading: false, error: message, resultUri: null });
    }
  };

  const reset = () => {
    setState({ isLoading: false, error: null, resultUri: null });
  };

  return { ...state, process, reset };
}