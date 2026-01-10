function Center({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      {children}
    </div>
  );
}

export default Center;
