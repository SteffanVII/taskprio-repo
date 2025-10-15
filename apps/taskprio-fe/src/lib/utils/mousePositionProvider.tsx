import React, { createContext, useEffect, useRef, useState } from "react";

type TMousePositionProviderContext = {
    mousePosition : {
        x : number,
        y : number
    }
}

export const MousePositionProviderContext = createContext<TMousePositionProviderContext>({
    mousePosition : {
        x : 0,
        y : 0
    }
})

type TMousePositionProviderProps = {
    children : React.ReactNode
}

const MousePositionProvider : React.FC<TMousePositionProviderProps> = ({
    children
}) => {

    const [ mousePositionX, setMousePositionX ] = useState(0)
    const [ mousePositionY, setMousePositionY ] = useState(0)

    const rootRef = useRef<HTMLElement>(document.documentElement)

    const mouseMoveHandler = ( e : MouseEvent ) => {
        setMousePositionX(e.clientX)
        setMousePositionY(e.clientY)
    }

    useEffect(() => {
        rootRef.current.addEventListener("mousemove", mouseMoveHandler)
        return () => {
            rootRef.current.removeEventListener("mousemove", mouseMoveHandler)
        }
    }, [])

    return (
        <MousePositionProviderContext.Provider
            value={{
                mousePosition : {
                    x : mousePositionX,
                    y : mousePositionY
                }
            }}
        >
            {children}
        </MousePositionProviderContext.Provider>
    )

}

export default MousePositionProvider;