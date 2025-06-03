import { toast } from "@/components/ui/use-toast";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export const useToast = () => {
  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 3000
  }: ToastProps) => {
    toast({
      title,
      description,
      variant: variant as "default" | "destructive",
      duration
    });
  };

  return { toast: showToast };
};