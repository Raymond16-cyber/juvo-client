import { cardClassName, cn } from "@/lib/ui";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return <section className={cn(cardClassName, className)}>{children}</section>;
}
