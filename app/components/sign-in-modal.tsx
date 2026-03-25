import { useNavigate } from "react-router"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { AppName } from "~/components/app-name"

interface SignInModalProps {
    open: boolean
    onClose: () => void
}

export function SignInModal({ open, onClose }: SignInModalProps) {
    const navigate = useNavigate()

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
            <DialogContent showCloseButton={false} className="text-center items-center">
                <DialogHeader className="items-center">
                    <DialogTitle asChild>
                        <AppName />
                    </DialogTitle>
                    <DialogDescription>
                        Sign in to access this page.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col border-none bg-transparent">
                    <Button
                        className="w-full"
                        onClick={() => { onClose(); navigate("/sign-in") }}
                    >
                        Sign in
                    </Button>
                    <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
                        Maybe later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
