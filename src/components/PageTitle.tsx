interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="mb-8 text-xl font-medium text-foreground">{children}</h1>
  );
}
