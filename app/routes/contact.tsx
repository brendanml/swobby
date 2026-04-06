import { Mail } from "lucide-react"
import GitHubIcon from "@mui/icons-material/GitHub"
import { Button } from "~/components/ui/button"

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Get in touch
            </p>
            <h1 className="text-5xl font-semibold tracking-tight mb-4">
                Say hello.
            </h1>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-10">
                Whether you have a question, a feature idea, or just want to
                chat — we'd love to hear from you.
            </p>

            <div className="flex flex-row  gap-3">
                <Button size="lg" className="rounded-full gap-2" asChild>
                    <a href="mailto:hello@swobby.org">
                        <Mail className="size-5" />
                        Email
                    </a>
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full gap-2"
                    asChild
                >
                    <a
                        href="https://github.com/brendanml/swobby"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon className="size-4" />
                        GitHub
                    </a>
                </Button>
            </div>
        </div>
    )
}
