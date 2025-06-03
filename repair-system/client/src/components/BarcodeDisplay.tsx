import { useRef, useEffect, useState } from "react";
import Barcode from "react-barcode";
import { Button } from "./ui/button";
import { Printer, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface BarcodeDisplayProps {
  value: string;
  text?: string;
  displayValue?: boolean;
  className?: string;
  printable?: boolean;
}

export function BarcodeDisplay({ value, text, displayValue = true, className = "", printable = false }: BarcodeDisplayProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Setup print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 250);
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    documentTitle: `Barcode-${value}`,
    onPrintError: (error) => {
      console.error("Print error:", error);
      setIsPrinting(false);
    },
    removeAfterPrint: true
  });

  // Make sure the component is fully rendered before attempting to print
  useEffect(() => {
    if (!componentRef.current) {
      console.warn("BarcodeDisplay component reference is not available");
    }
  }, []);

  // Added check to ensure value is not empty
  if (!value) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={componentRef}
        className="p-4 bg-white rounded-md"
        style={{ minWidth: '200px', minHeight: '100px' }}
      >
        <Barcode
          value={value || "0000000000"}
          displayValue={displayValue}
          text={text}
          width={1.5}
          height={50}
          fontSize={14}
          margin={10}
        />
      </div>

      {printable && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handlePrint}
          disabled={isPrinting || !value}
        >
          {isPrinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Print Barcode
            </>
          )}
        </Button>
      )}
    </div>
  );
}