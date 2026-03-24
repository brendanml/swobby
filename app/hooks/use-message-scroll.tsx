import { useCallback, useRef } from "react"

export function useMessageScroll() {
    const containerRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = useCallback(() => {
        if (!containerRef.current) return
        containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [])

    return { containerRef, scrollToBottom }
}
