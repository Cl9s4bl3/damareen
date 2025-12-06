import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import {StyleDropdown} from "@/components/StyleDropdown";

interface WorldNameStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function WorldNameStep({ data, onUpdate, onNext }: WorldNameStepProps) {
  const isDisabled = !data.worldName.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Card
        className="w-full max-w-2xl mx-auto border-none shadow-lg"
        style={{
          background: "hsl(0, 0%, 10%)",
          color: "hsl(0, 0%, 90%)",
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-center text-2xl font-semibold"
            style={{ color: "hsl(0, 0%, 95%)" }}
          >
            Készítsd El Világod
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Világ neve input */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label htmlFor="worldName" style={{ color: "hsl(0, 0%, 75%)" }}>
              Világ neve *
            </Label>
            <Input
              id="worldName"
              value={data.worldName}
              onChange={(e) => onUpdate({ worldName: e.target.value })}
              placeholder="Írd be a világod nevét..."
              className="text-lg border-none focus:ring-2 focus:ring-[hsl(0,0%,70%)]"
              style={{
                background: "hsl(0, 0%, 15%)",
                color: "hsl(0, 0%, 95%)",
                borderRadius: "0.5rem",
              }}
            />
          </motion.div>

          {/* Világ leírása */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="description" style={{ color: "hsl(0, 0%, 75%)" }}>
              Világ leírása
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Részletezd a világod..."
              rows={4}
              className="resize-none border-none focus:ring-2 focus:ring-[hsl(0,0%,70%)]"
              style={{
                background: "hsl(0, 0%, 15%)",
                color: "hsl(0, 0%, 95%)",
                borderRadius: "0.5rem",
              }}
            />
          </motion.div>


            <motion.div initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.45 }} className="space-y-2">
                <Label htmlFor="bgStyle">Világ Stílusa</Label>
                <StyleDropdown
                    selectedStyle={data.bgStyle}
                    onStyleChange={(style) => onUpdate({ bgStyle: style })}
                />
                <p className="text-sm text-gray-400">
                    A stílus befolyásolja a kártyák és a környezet megjelenését
                </p>
            </motion.div>
            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0 pt-4">
                <motion.button
                    whileHover={{
                        scale: 1.05,
                        backgroundColor: "hsl(0, 0%, 85%)",
                        color: "hsl(0, 0%, 10%)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => redirect("/dashboard")}
                    className="px-4 py-2 md:px-6 md:py-2 rounded-md font-semibold transition-colors text-sm md:text-base bg-gray-700 text-gray-100 hover:bg-white hover:text-black cursor-pointer"
                >
                    Vissza
                </motion.button>

                <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={!isDisabled ? { scale: 0.97 } : {}}
                    onClick={onNext}
                    disabled={isDisabled}
                    className="px-8 py-2 font-semibold rounded-md transition-colors text-sm"
                    style={{
                        background: isDisabled ? "hsl(0, 0%, 40%)" : "hsl(0, 0%, 95%)",
                        color: isDisabled ? "hsl(0, 0%, 70%)" : "hsl(0, 0%, 10%)",
                        opacity: isDisabled ? 0.6 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                >
                    Következő: Kártyák Elkészítése
                </motion.button>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
