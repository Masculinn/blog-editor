import { Badge } from "../ui/badge";
import Ping from "./ping";

export function PostDifficulty({
  level,
  clasName,
  style,
}: {
  level: number;
  clasName?: string;
  style?: React.CSSProperties;
}) {
  const postLvl =
    level === 1 ? "success" : level === 2 ? "primary" : "destructive";
  const postLvlText =
    level === 1 ? "Beginner" : level === 2 ? "Intermediate" : "Advanced";
  return (
    <Badge className={clasName} variant={postLvl} style={style}>
      <Ping mode={postLvl} size="sm" />
      <span>{postLvlText}</span>
    </Badge>
  );
}
