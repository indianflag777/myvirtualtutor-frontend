export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate rounded-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform shadow-md">
      <div className="text-accent-blue mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  );
}
