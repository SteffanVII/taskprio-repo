import { LoaderCircle } from "lucide-react"

type SpinnerSize = "sm" | "md" | "lg" | "xl"

interface SpinnerProps {
    size?: SpinnerSize
}

const sizeMap: Record<SpinnerSize, string> = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
}

const Spinner = ({ size = "md" }: SpinnerProps) => {
    return (
        <LoaderCircle className={`animate-spin ${sizeMap[size]}`} />
    )
}

export default Spinner