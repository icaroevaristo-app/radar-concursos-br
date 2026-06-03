import { Card } from "@/components/ui/card";

type PlaceholderPanelProps = {
  title: string;
  items: string[];
};

export function PlaceholderPanel({ title, items }: PlaceholderPanelProps) {
  return (
    <Card className="h-fit p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
