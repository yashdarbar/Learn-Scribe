"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

  export default function Dashboard() {
    const router = useRouter();
    const supabase = supabaseBrowser();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            console.log(error);
            // toast.success(error?.message);
            router.push('/login')
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <Button onClick={handleLogout}>DAshborad</Button>
        </div>
    );
}