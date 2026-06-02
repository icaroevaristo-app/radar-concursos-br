import { toggleSaveContestAction } from "@/lib/contests/actions";
import { Button } from "@/components/ui/button";

type SaveContestButtonProps = {
  contestId: string;
  isSaved: boolean;
  className?: string;
};

export function SaveContestButton({ contestId, isSaved, className }: SaveContestButtonProps) {
  return (
    <form action={toggleSaveContestAction}>
      <input name="contest_id" type="hidden" value={contestId} />
      <Button className={className} type="submit" variant={isSaved ? "outline" : "primary"}>
        {isSaved ? "Remover dos salvos" : "Salvar concurso"}
      </Button>
    </form>
  );
}
