interface StateScreenProps {
  title: string;
  description: string;
  code?: string;
  loading?: boolean;
}

export function StateScreen({ title, description, code, loading }: StateScreenProps) {
  return (
    <div className="state-screen">
      {loading ? <div className="loader" /> : <span className="state-kicker">Showcase unavailable</span>}
      <h1>{title}</h1>
      <p>{description}</p>
      {code && <code>{code}</code>}
    </div>
  );
}
