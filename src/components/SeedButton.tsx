import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const SeedButton = () => {
    const seedMutation = useMutation(api.memoria.seed);

    const handleSeed = async () => {
        const result = await seedMutation();
        alert(result);
    };

    return (
        <Button onClick={handleSeed} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Seed Content
        </Button>
    );
};

export default SeedButton;
