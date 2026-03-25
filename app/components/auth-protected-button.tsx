import { Button } from "~/components/ui/button"
import { useSignInModal } from "~/context/sign-in-modal"
import type { ComponentProps } from "react"

type Props = Omit<ComponentProps<typeof Button>, "onClick"> & {
    onClick: () => void
}

export function AuthProtectedButton({ onClick, children, ...props }: Props) {
    const { requireAuth } = useSignInModal()

    return (
        <Button {...props} onClick={() => requireAuth(onClick)}>
            {children}
        </Button>
    )
}
