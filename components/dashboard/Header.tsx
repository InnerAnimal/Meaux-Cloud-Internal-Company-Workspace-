export default function Header() {
  return (
    <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
      <h1 className="text-4xl font-bold text-primary">Cloud Services Dashboard</h1>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
          SM
        </div>
        <span className="text-lg font-medium">Sam Meauxbility</span>
      </div>
    </div>
  );
}
