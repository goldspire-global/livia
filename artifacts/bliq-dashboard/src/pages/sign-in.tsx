import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignInPage() {
  const { theme } = useTheme();
  
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bliq</h1>
          <p className="text-muted-foreground mt-2">Welcome back to your command center</p>
        </div>
        <SignIn
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-card border border-border shadow-md",
            },
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}
