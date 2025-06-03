import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusText } from "@/lib/statusColors";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  
  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${colorClass} ${className}`}
    >
      {getStatusText(status)}
    </Badge>
  );
}