import { LoaderCircle } from "lucide-react"

export type SpinnerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl"

interface SpinnerProps {
    size?: SpinnerSize
}

const sizeMap: Record<SpinnerSize, string> = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
    "2xl": "w-12 h-12",
    "3xl": "w-14 h-14",
    "4xl": "w-16 h-16",
    "5xl": "w-18 h-18",
    "6xl": "w-20 h-20",
    "7xl": "w-22 h-22",
    "8xl": "w-24 h-24",
    "9xl": "w-26 h-26",
    "10xl": "w-28 h-28"
}

const Spinner = ({ size = "md" }: SpinnerProps) => {
    return (
        <LoaderCircle className={`animate-spin ${sizeMap[size]}`} />
    )
}

export default Spinner