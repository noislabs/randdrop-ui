import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  useToast,
  Text,
  Divider,
  Heading,
} from "@chakra-ui/react";

export interface ErrorData {
  readonly title: string;
  readonly description: string;
}

interface Props {
  error: ErrorData;
}

export function ErrorAlert({ error }: Props): JSX.Element {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription>{error.description}</AlertDescription>
    </Alert>
  );
}
