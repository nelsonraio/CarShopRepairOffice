import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - MQAuto",
  description: "Entrar na aplicação MQAuto",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
